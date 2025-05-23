package com.aegis

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.*

class ScreenTimeModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ScreenTimeModule"

    @ReactMethod
    fun getTotalScreenTime(promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            promise.reject("UNSUPPORTED", "API 21+ required")
            return
        }

        try {
            val usageStatsManager = reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }

            val usageStatsMap = usageStatsManager.queryAndAggregateUsageStats(
                calendar.timeInMillis,
                System.currentTimeMillis()
            )

            val totalForegroundTime = usageStatsMap.values.sumOf { it.totalTimeInForeground }
            promise.resolve((totalForegroundTime / 1000).toInt())
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getAppUsageStats(promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            promise.reject("UNSUPPORTED", "API 21+ required")
            return
        }

        try {
            val usageStatsManager = reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }

            val usageStatsMap = usageStatsManager.queryAndAggregateUsageStats(
                calendar.timeInMillis,
                System.currentTimeMillis()
            )

            val appList = Arguments.createArray()
            var totalTime = 0L

            for ((packageName, stats) in usageStatsMap) {
                if (stats.totalTimeInForeground > 0) {
                    totalTime += stats.totalTimeInForeground
                    try {
                        val appInfo = reactContext.packageManager.getApplicationInfo(packageName, 0)
                        val appName = reactContext.packageManager.getApplicationLabel(appInfo).toString()

                        val appData = Arguments.createMap().apply {
                            putString("packageName", packageName)
                            putString("appName", appName)
                            putInt("usageTime", (stats.totalTimeInForeground / 1000).toInt())
                        }
                        appList.pushMap(appData)
                    } catch (_: PackageManager.NameNotFoundException) { }
                }
            }

            val result = Arguments.createMap().apply {
                putInt("totalScreenTime", (totalTime / 1000).toInt())
                putArray("appList", appList)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun hasUsageAccessPermission(callback: Callback) {
        try {
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactContext.packageName
                )
            } else {
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactContext.packageName
                )
            }
            callback.invoke(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            callback.invoke(false)
        }
    }

    @ReactMethod
    fun openUsageAccessSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                putExtra(Settings.EXTRA_APP_PACKAGE, reactContext.packageName)
            }
        }
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun startScreenTimeService(childId: String) {
        reactContext.getSharedPreferences("ScreenTimePrefs", Context.MODE_PRIVATE)
            .edit()
            .putString("childId", childId)
            .apply()

        val intent = Intent(reactContext, ScreenTimeService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    @ReactMethod
    fun stopScreenTimeService() {
        val intent = Intent(reactContext, ScreenTimeService::class.java)
        reactContext.stopService(intent)
    }
}
