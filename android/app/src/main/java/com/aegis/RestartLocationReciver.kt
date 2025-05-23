package com.aegis

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.preference.PreferenceManager // Use androidx.preference.PreferenceManager if migrated to AndroidX
import android.util.Log

class RestartLocationReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == "restart_location_service") {

            // Retrieve the saved childId from SharedPreferences
            val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context)
            val childId = sharedPreferences.getString("childId", null)

            if (!childId.isNullOrEmpty()) {
                val serviceIntent = Intent(context, LocationForegroundService::class.java).apply {
                    putExtra("childId", childId)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }

                Log.i("RestartLocationReceiver", "Location service restarted with childId: $childId")
            } else {
                Log.w("RestartLocationReceiver", "No childId found, skipping location service restart")
            }
        }
    }
}
