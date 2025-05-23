import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import androidx.annotation.RequiresApi
import com.aegis.R
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.ktx.Firebase
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import com.aegis.network.IPHeader
import com.aegis.network.TCPHeader
import com.aegis.network.UDPHeader
import com.aegis.network.extractUrl
import android.net.Uri
import android.os.Build

class ContentFilteringVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private var outputStream: FileOutputStream? = null
    private val blockedUrls = mutableSetOf<String>()
    private lateinit var firestore: FirebaseFirestore
    private var listenerRegistration: ListenerRegistration? = null

    companion object {
        private const val VPN_CHANNEL_ID = "vpn_channel"
        private const val NOTIFICATION_ID = 1
        private const val TAG = "ParentalControlVPN"
    }

    override fun onCreate() {
        super.onCreate()
        firestore = FirebaseFirestore.getInstance()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        handleBatteryOptimizations()
        startForegroundService()
        startVpn()
        setupBlockListListener()
        return START_STICKY
    }

    private fun handleBatteryOptimizations() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(POWER_SERVICE) as PowerManager
            if (!manager.isIgnoringBatteryOptimizations(packageName)) {
                Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:$packageName")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    startActivity(this)
                }
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            VPN_CHANNEL_ID,
            "Content Filtering VPN",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Network traffic monitoring service"
        }
        
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).apply {
            createNotificationChannel(channel)
        }
    }

    private fun startForegroundService() {
        val notification = Notification.Builder(this, VPN_CHANNEL_ID)
            .setContentTitle(getString(R.string.vpn_notification_title))
            .setContentText(getString(R.string.vpn_notification_text))
            .setSmallIcon(R.drawable.ic_vpn)
            .setPriority(Notification.PRIORITY_LOW)
            .setOngoing(true)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    private fun startVpn() {
        try {
            val builder = Builder().apply {
                setSession("ParentalControlVPN")
                addAddress("10.0.0.2", 32)
                addDnsServer("8.8.8.8")
                addRoute("0.0.0.0", 0)
                setBlocking(true)
                setMtu(1500)
            }

            vpnInterface = builder.establish()
            outputStream = FileOutputStream(vpnInterface?.fileDescriptor)
            Thread(VpnRunnable()).start()
            Log.d(TAG, "VPN service started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "VPN setup failed", e)
            stopSelf()
        }
    }

    private fun setupBlockListListener() {
        Firebase.auth.currentUser?.uid?.let { childId ->
            firestore.collection("users").document(childId)
                .get()
                .addOnSuccessListener { document ->
                    document.getString("parentId")?.let { parentId ->
                        listenerRegistration = firestore.collection("users")
                            .document(parentId)
                            .collection("blockedUrls")
                            .addSnapshotListener { snapshot, error ->
                                if (error != null) {
                                    Log.e(TAG, "Firestore error", error)
                                    return@addSnapshotListener
                                }

                                snapshot?.documents?.let { docs ->
                                    blockedUrls.clear()
                                    docs.mapNotNull { it.getString("host") }
                                        .forEach { url ->
                                            blockedUrls.add(url.lowercase())
                                        }
                                    Log.d(TAG, "Blocklist updated: ${blockedUrls.size} entries")
                                }
                            }
                    }
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "Parent ID fetch failed", e)
                }
        }
    }

    inner class VpnRunnable : Runnable {
        override fun run() {
            try {
                vpnInterface?.fileDescriptor?.let { fd ->
                    FileInputStream(fd).use { inputStream ->
                        val buffer = ByteArray(32768)
                        while (vpnInterface != null && !Thread.interrupted()) {
                            try {
                                val bytesRead = inputStream.read(buffer)
                                if (bytesRead > 0) {
                                    processPacket(buffer.copyOf(bytesRead))
                                }
                            } catch (e: IOException) {
                                if (!e.message?.contains("Interrupted system call", true)!!) {
                                    throw e
                                }
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "VPN operation failed", e)
                stopSelf()
            }
        }

        private fun processPacket(packet: ByteArray) {
            if (shouldBlock(packet)) {
                Log.d(TAG, "Blocking restricted content")
                // Drop the packet by not forwarding
            } else {
                try {
                    outputStream?.write(packet)
                } catch (e: IOException) {
                    Log.e(TAG, "Packet write failed", e)
                }
            }
        }

        private fun shouldBlock(packet: ByteArray): Boolean {
            return try {
                val ipHeader = IPHeader(packet, 0)
                when (ipHeader.protocol) {
                    IPHeader.TCP -> handleTcpPacket(ipHeader, packet)
                    IPHeader.UDP -> handleUdpPacket(ipHeader, packet)
                    else -> false
                }
            } catch (e: Exception) {
                Log.e(TAG, "Packet analysis error", e)
                false
            }
        }

        private fun handleTcpPacket(ipHeader: IPHeader, packet: ByteArray): Boolean {
            val tcpHeader = TCPHeader(packet, ipHeader.headerLength)
            return when (tcpHeader.destinationPort) {
                80, 443 -> checkHttpPacket(ipHeader, tcpHeader, packet)
                else -> false
            }
        }

        private fun checkHttpPacket(ipHeader: IPHeader, tcpHeader: TCPHeader, packet: ByteArray): Boolean {
            val url = extractUrl(
                packet,
                ipHeader.headerLength + tcpHeader.headerLength
            )
                .replace("www.", "")
                .replace(".", "_")
                .lowercase()

            return isUrlBlocked(url)
        }

        private fun handleUdpPacket(ipHeader: IPHeader, packet: ByteArray): Boolean {
            val udpHeader = UDPHeader(packet, ipHeader.headerLength)
            return if (udpHeader.destinationPort == 53) {
                parseAndCheckDnsQuery(packet, ipHeader, udpHeader)
            } else {
                false
            }
        }

        private fun parseAndCheckDnsQuery(
            packet: ByteArray,
            ipHeader: IPHeader,
            udpHeader: UDPHeader
        ): Boolean {
            return try {
                val dnsData = packet.copyOfRange(
                    ipHeader.headerLength + udpHeader.headerLength,
                    packet.size
                )
                val query = parseDnsQuery(dnsData)
                isUrlBlocked(query)
            } catch (e: Exception) {
                Log.e(TAG, "DNS processing failed", e)
                false
            }
        }

        private fun parseDnsQuery(dnsData: ByteArray): String {
            try {
                if (dnsData.size < 12) return ""
                if (dnsData[2].toInt() and 0x80 != 0) return "" // Skip responses

                val questions = (dnsData[4].toInt() shl 8) or dnsData[5].toInt()
                if (questions != 1) return ""

                var position = 12 // Start after DNS header
                val query = StringBuilder()

                while (position < dnsData.size && dnsData[position].toInt() != 0x00) {
                    val length = dnsData[position].toInt()
                    position++
                    if (position + length > dnsData.size) break

                    query.append(
                        dnsData.copyOfRange(position, position + length).decodeToString()
                    )
                    query.append(".")
                    position += length
                }

                return query.toString()
                    .dropLast(1)
                    .replace("www.", "")
                    .replace(".", "_")
                    .lowercase()
            } catch (e: Exception) {
                Log.e(TAG, "DNS parsing error", e)
                return ""
            }
        }

        private fun isUrlBlocked(url: String): Boolean {
            return blockedUrls.any { blocked ->
                url == blocked || url.contains(blocked)
            }
        }
    }

    override fun onDestroy() {
        try {
            listenerRegistration?.remove()
            vpnInterface?.close()
            outputStream?.close()
            Log.d(TAG, "VPN service stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Service cleanup error", e)
        }
        super.onDestroy()
    }
}