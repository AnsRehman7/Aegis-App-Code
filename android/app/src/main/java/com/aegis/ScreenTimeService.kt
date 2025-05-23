package com.aegis

import android.app.*
import android.app.usage.UsageStatsManager
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.os.*
import android.util.Log
import android.content.pm.PackageManager
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import androidx.work.*
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.TimeUnit

class ScreenTimeService : Service() {
    private lateinit var firestore: FirebaseFirestore
    private lateinit var handler: Handler
    private lateinit var runnable: Runnable
    private var childId: String? = null

    override fun onCreate() {
        super.onCreate()
        firestore = FirebaseFirestore.getInstance()
        handler = Handler(Looper.getMainLooper())

        childId = getSharedPreferences("ScreenTimePrefs", Context.MODE_PRIVATE)
            .getString("childId", null)

        startForeground(1, createNotification())
        startMonitoring()
    }

    private fun createNotification(): Notification {
        val channelId = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel()
        } else {
            ""
        }

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Screen Time Monitoring")
            .setContentText("Tracking your usage")
            .setSmallIcon(R.drawable.ic_notification)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createNotificationChannel(): String {
        val channelId = "screen_time_channel"
        val channel = NotificationChannel(channelId, "Screen Time", NotificationManager.IMPORTANCE_LOW)
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        return channelId
    }

    private fun startMonitoring() {
        runnable = object : Runnable {
            override fun run() {
                checkUsageAndLock()
                uploadScreenTimeData()
                handler.postDelayed(this, 30 * 60 * 1000) // 30 minutes interval
            }
        }
        handler.post(runnable)
        schedulePeriodicWork()
    }

    private fun uploadScreenTimeData() {
        if (!hasUsagePermission() || childId.isNullOrEmpty()) return

        val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        val usageStats = usageStatsManager.queryAndAggregateUsageStats(
            calendar.timeInMillis,
            System.currentTimeMillis()
        )

        val totalTime = usageStats.values.sumOf { it.totalTimeInForeground }
        val appList = mutableListOf<Map<String, Any>>()

        for ((packageName, stats) in usageStats) {
            if (stats.totalTimeInForeground > 0) {
                try {
                    val appInfo = packageManager.getApplicationInfo(packageName, 0)
                    val appName = packageManager.getApplicationLabel(appInfo).toString()

                    appList.add(mapOf(
                        "packageName" to packageName,
                        "appName" to appName,
                        "usageTime" to (stats.totalTimeInForeground / 1000)
                    ))
                } catch (_: PackageManager.NameNotFoundException) { }
            }
        }

        val data = mapOf(
            "total" to (totalTime / 1000),
            "apps" to appList,
            "updatedAt" to FieldValue.serverTimestamp()
        )

        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        
        firestore.collection("Children").document(childId!!)
            .collection("screenTime").document(today)
            .set(data)
            .addOnSuccessListener {
                Log.d("ScreenTimeService", "Data uploaded successfully")
            }
            .addOnFailureListener { e ->
                Log.e("ScreenTimeService", "Error uploading data", e)
            }
    }

    private fun schedulePeriodicWork() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val screenTimeWork = PeriodicWorkRequestBuilder<ScreenTimeWorker>(
            30, TimeUnit.MINUTES,
            5, TimeUnit.MINUTES)
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(this)
            .enqueueUniquePeriodicWork(
                "screenTimeUpload",
                ExistingPeriodicWorkPolicy.KEEP,
                screenTimeWork
            )
    }

    private fun checkUsageAndLock() {
        if (!hasUsagePermission() || childId.isNullOrEmpty()) return

        val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        val usageStats = usageStatsManager.queryAndAggregateUsageStats(
            calendar.timeInMillis,
            System.currentTimeMillis()
        )

        val totalTime = usageStats.values.sumOf { it.totalTimeInForeground }

        firestore.collection("Children").document(childId!!).get()
            .addOnSuccessListener { doc ->
                val dailyLimit = doc.getLong("dailyLimit")?.times(60_000L)
                val locked = doc.getBoolean("locked") ?: false

                if (dailyLimit != null && totalTime >= dailyLimit && !locked) {
                    triggerLockScreen()
                    firestore.collection("Children").document(childId!!).update("locked", true)
                }
            }
    }

    private fun triggerLockScreen() {
        val intent = Intent(this, LockScreenActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
            putExtra("fromService", true)
        }
        startActivity(intent)
    }

    private fun hasUsagePermission(): Boolean {
        val appOps = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), packageName)
        return mode == AppOpsManager.MODE_ALLOWED
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onDestroy() {
        handler.removeCallbacks(runnable)
        super.onDestroy()
    }
}