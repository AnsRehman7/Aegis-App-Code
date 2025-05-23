package com.aegis

import android.content.Intent
import android.os.Build
import androidx.work.Worker
import androidx.work.WorkerParameters

class ScreenTimeWorker(context: android.content.Context, params: WorkerParameters) : Worker(context, params) {
    override fun doWork(): Result {
        return try {
            val prefs = applicationContext.getSharedPreferences("ScreenTimePrefs", android.content.Context.MODE_PRIVATE)
            val childId = prefs.getString("childId", null)

            if (childId != null) {
                val intent = Intent(applicationContext, ScreenTimeService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    applicationContext.startForegroundService(intent)
                } else {
                    applicationContext.startService(intent)
                }
            }
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
