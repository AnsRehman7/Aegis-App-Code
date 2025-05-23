import React, { createContext, useContext } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
//import database from "@react-native-firebase/database";
import { Alert, Platform } from "react-native";
import { useCallback, useState, useEffect } from 'react';

const firebaseContext = createContext();
export const useFirebase = () => useContext(firebaseContext);

// 🔐 Signup Child
const SignupChild = async (email, password, childDetails, parentId) => {
  try {
    if (!childDetails?.name?.trim()) throw new Error("Child name is required.");

    const { name, mobileNumber, age } = childDetails;
    const trimmedName = name.trim();

    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const userID = userCredential.user.uid;

    await firestore().runTransaction(async (transaction) => {
      const childRef = firestore().collection("Children").doc(userID);
      transaction.set(childRef, {
        UID: userID,
        name: trimmedName,
        email,
        mobileNumber,
        age,
        paired: false,
      });

      if (parentId) {
        const pairedChildRef = firestore()
          .collection("users")
          .doc(parentId)
          .collection("pairedChildren")
          .doc(userID);
        transaction.set(pairedChildRef, {
          name: trimmedName,
          childId: userID,
          pairedAt: new Date(),
        });
      }
    });

    Alert.alert("Success", "Account created successfully!");
    return userCredential.user;
  } catch (error) {
    console.error("Signup Error:", error.message);
    Alert.alert("Error", error.message);
    throw error;
  }
};

// 🔓 Login
const LoginWithEmail = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// 🔗 Pair Child with Parent
const pairChildWithCode = async (parentId, childId, childName) => {
  try {
    if (!childName?.trim()) throw new Error("Child name cannot be empty");

    const trimmedName = childName.trim();
    const batch = firestore().batch();

    const pairedChildRef = firestore()
      .collection("users")
      .doc(parentId)
      .collection("pairedChildren")
      .doc(childId);

    batch.set(pairedChildRef, {
      name: trimmedName,
      childId,
      pairedAt: new Date(),
      paired: true
    });

    const childRef = firestore().collection("Children").doc(childId);
    batch.update(childRef, {
      name: trimmedName,
      parentId,
      paired: true,
      pairedAt: new Date()
    });

    await batch.commit();
    console.log(`Child ${childId} paired with name: ${trimmedName}`);
  } catch (error) {
    console.error("Error pairing child:", error);
    throw error;
  }
};

// ❌ Unpair Child
const unpairChild = async (childId) => {
  try {
    const childRef = firestore().collection("Children").doc(childId);
    const childDoc = await childRef.get();
    if (!childDoc.exists) throw new Error("Child not found.");

    const parentId = childDoc.data().parentId;
    if (parentId) {
      await firestore()
        .collection("users")
        .doc(parentId)
        .collection("pairedChildren")
        .doc(childId)
        .delete();
    }

    await childRef.update({
      paired: false,
      pairedAt: null,
      parentId: firestore.FieldValue.delete(),
      location: firestore.FieldValue.delete(),
    });

    console.log("Child unpaired successfully!");
  } catch (error) {
    console.error("Error unpairing child:", error);
    throw error;
  }
};

// 📄 Get Parent ID
const getParentIdFromFirestore = async (childId) => {
  try {
    const childDoc = await firestore().collection("Children").doc(childId).get();
    if (!childDoc.exists) return null;
    return childDoc.data().parentId || null;
  } catch (error) {
    console.error("Error fetching parent ID:", error);
    return null;
  }
};

// 👦 Get Child Info
const getChildInfo = async (childId) => {
  try {
    const doc = await firestore().collection("Children").doc(childId).get();
    if (!doc.exists) throw new Error("Child not found");
    return doc.data();
  } catch (error) {
    console.error("Error getting child info:", error);
    throw error;
  }
};

// ⏱️ Update Screen Time
const updateScreenTime = async (childId, date, screenTimeData) => {
  try {
    await firestore()
      .collection('Children')
      .doc(childId)
      .collection('screenTime')
      .doc(date)
      .set({
        ...screenTimeData,
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
  } catch (error) {
    console.error('Error updating screen time:', error);
    throw error;
  }
};

  // 🚫 Get Blocked URLs
  const getBlockedUrls = useCallback(async (userId) => {
    try {
      const snapshot = await firestore()
        .collection("users")
        .doc(userId)
        .collection("blockedUrls")
        .get();
      
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error("Error getting blocked URLs:", error);
      throw error;
    }
  }, []);

  // 🎣 Listen for Blocked URLs Changes
 const useBlockedUrlsListener = (userId) => {
  const [blockedUrls, setBlockedUrls] = useState(null); // Start with null to indicate loading

  useEffect(() => {
    if (!userId) {
      setBlockedUrls([]);
      return;
    }

    const unsubscribe = firestore()
      .collection("users")
      .doc(userId)
      .collection("blockedUrls")
      .onSnapshot(
        snapshot => {
          const urls = snapshot.docs.map(doc => doc.id);
          setBlockedUrls(urls);
        },
        error => {
          console.error("Error listening to blocked URLs:", error);
          setBlockedUrls([]);
        }
      );

    return () => unsubscribe();
  }, [userId]);

  return blockedUrls;
};
// 📍 Update Child Location in Realtime DB
// const updateLiveLocation = async (childId, latitude, longitude) => {
//   try {
//     await database()
//       .ref(`/liveLocation/${childId}`)
//       .set({
//         latitude,
//         longitude,
//         timestamp: new Date().toISOString(),
//       });
//   } catch (error) {
//     console.error("Error updating location:", error);
//   }
// };


export const FirebaseProvider = ({ children }) => {
  return (
    <firebaseContext.Provider
      value={{
        SignupChild,
        LoginWithEmail,
        pairChildWithCode,
        unpairChild,
        getParentIdFromFirestore,
        getChildInfo,
        updateScreenTime,
        getBlockedUrls,
        useBlockedUrlsListener
        // updateLiveLocation,
      }}
    >
      {children}
    </firebaseContext.Provider>
  );
};
