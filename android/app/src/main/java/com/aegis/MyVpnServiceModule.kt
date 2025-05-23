package com.aegis

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class MyVpnServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "MyVpnService"

    @ReactMethod
    fun startVpnService() {
        currentActivity?.let { 
            ServiceManager.startVpnService(it)
        }
    }

    @ReactMethod
    fun stopVpnService() {
        reactApplicationContext.stopService(
            Intent(reactApplicationContext, ContentFilteringVpnService::class.java)
        )
    }
}