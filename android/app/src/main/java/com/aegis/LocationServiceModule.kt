package com.aegis

import android.content.Intent
import android.os.Build
import android.preference.PreferenceManager // ✅ Import for SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class LocationServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "LocationServiceModule"

    @ReactMethod
    fun startServiceWithChildId(childId: String) {
        val context = reactApplicationContext

        // ✅ Save childId to SharedPreferences
        val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context)
        sharedPreferences.edit().putString("childId", childId).apply()

        val serviceIntent = Intent(context, LocationForegroundService::class.java).apply {
            putExtra("childId", childId)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent)
        } else {
            context.startService(serviceIntent)
        }
    }

    @ReactMethod
    fun stopService() {
        val context = reactApplicationContext
        val serviceIntent = Intent(context, LocationForegroundService::class.java)
        context.stopService(serviceIntent)
    }
}
