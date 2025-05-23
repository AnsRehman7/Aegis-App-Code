package com.aegis

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import androidx.core.content.ContextCompat

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "Aegis"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)

    if (requestCode == 1001 && resultCode == RESULT_OK) {
      // Permission granted, start the VPN
      ContextCompat.startForegroundService(
        this,
        Intent(this, ContentFilteringVpnService::class.java)
      )
    }
  }
}
