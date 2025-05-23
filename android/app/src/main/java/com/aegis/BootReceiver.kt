package com.aegis

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.content.ContextCompat

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            // Start ScreenTimeService
            val screenTimeIntent = Intent(context, ScreenTimeService::class.java)
            ContextCompat.startForegroundService(context, screenTimeIntent)

            // Start ContentFilteringVpnService
            val vpnIntent = Intent(context, ContentFilteringVpnService::class.java)
            ContextCompat.startForegroundService(context, vpnIntent)
        }
    }
}
