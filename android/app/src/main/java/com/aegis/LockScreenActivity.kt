package com.aegis

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText
import androidx.core.content.ContextCompat
import com.google.firebase.firestore.FirebaseFirestore

class LockScreenActivity : Activity() {
    private lateinit var firestore: FirebaseFirestore
    private var childId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lock_screen) // Make sure this matches your layout file name

        // Make activity show over lock screen
        window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED)
        window.addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        firestore = FirebaseFirestore.getInstance()
        childId = getSharedPreferences("ScreenTimePrefs", Context.MODE_PRIVATE)
            .getString("childId", null)

        val unlockButton = findViewById<Button>(R.id.unlock_button)
        val pinInput = findViewById<EditText>(R.id.pinInput)

        unlockButton.setOnClickListener {
            val enteredPin = pinInput.text.toString()
            checkUnlockCode(enteredPin)
        }
    }

    private fun checkUnlockCode(enteredPin: String) {
        if (childId == null) return

        firestore.collection("Children").document(childId!!).get()
            .addOnSuccessListener { document ->
                val storedPin = document.getString("unlockCode") ?: ""
                
                if (storedPin == enteredPin) {
                    firestore.collection("Children").document(childId!!)
                        .update("locked", false)
                    finish()
                }
            }
    }

    override fun onBackPressed() {
        // Disable back button
    }
}