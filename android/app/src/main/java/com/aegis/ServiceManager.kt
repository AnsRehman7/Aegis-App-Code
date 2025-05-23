package com.aegis

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.VpnService
import androidx.core.content.ContextCompat

object ServiceManager {
    private const val VPN_REQUEST_CODE = 1001

    fun startVpnService(activity: Activity) {
        val intent = VpnService.prepare(activity)
        if (intent != null) {
            activity.startActivityForResult(intent, VPN_REQUEST_CODE)
        } else {
            // Already has permission, start VPN directly
            ContextCompat.startForegroundService(
                activity,
                Intent(activity, ContentFilteringVpnService::class.java)
            )
        }
    }

    fun stopVpnService(context: Context) {
        context.stopService(Intent(context, ContentFilteringVpnService::class.java))
    }
}
