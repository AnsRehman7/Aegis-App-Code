import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.ktx.Firebase
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.QuerySnapshot
import com.google.firebase.firestore.FirebaseFirestoreException

// BlockedUrlsRepository.kt
class BlockedUrlsRepository {
    private val firestore = FirebaseFirestore.getInstance()

    fun getBlockedUrls(parentId: String, callback: (Set<String>) -> Unit) {
        firestore.collection("users").document(parentId)
            .collection("blockedUrls")
            .addSnapshotListener { snapshot, _ ->
                val urls = snapshot?.documents
                    ?.mapNotNull { it.getString("host") }  // Changed from it.id
                    ?.toSet() ?: emptySet()
                callback(urls)
            }
    }
}