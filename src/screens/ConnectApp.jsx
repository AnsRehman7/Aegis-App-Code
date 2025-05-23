import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const ConnectApp = ({ navigation }) => {
  const [manualCode, setManualCode] = useState("");
  const [isPaired, setIsPaired] = useState(false);

  useEffect(() => {
    const checkPairedStatus = async () => {
      const user = auth().currentUser;

      if (user) {
        const childDocRef = firestore().collection("Children").doc(user.uid);
        const docSnap = await childDocRef.get();

        if (docSnap.exists && docSnap.data().paired) {
          setIsPaired(true);
          navigation.navigate("DrawerNavigator", { screen: "Information" });
        }
      }
    };

    checkPairedStatus();
  }, [navigation]);

  const handleManualEntry = async () => {
    if (!manualCode) {
      Alert.alert("Error", "Please enter the 4-digit code.");
      return;
    }
  
    try {
      const childUser = auth().currentUser;
      if (!childUser) throw new Error("User not authenticated");
  
      const pairingSnapshot = await firestore()
        .collectionGroup("pairingCodes")
        .where("fourDigitCode", "==", manualCode)
        .where("paired", "==", false)
        .get();
  
      if (pairingSnapshot.empty) {
        throw new Error("Invalid or expired code. Please generate a new one.");
      }
  
      const pairingDoc = pairingSnapshot.docs[0];
      const parentId = pairingDoc.ref.parent.parent?.id;
  
      if (!parentId) {
        throw new Error("Parent document not found.");
      }
  
      const childDoc = await firestore()
        .collection("Children")
        .doc(childUser.uid)
        .get();
        
      if (!childDoc.exists) {
        throw new Error("Child profile not found.");
      }
  
      const childName = childDoc.data().Name || "Unnamed";
  
      const batch = firestore().batch();
      
      batch.update(pairingDoc.ref, { 
        paired: true,
        pairedAt: firestore.FieldValue.serverTimestamp(),
        childId: childUser.uid
      });
      
      batch.set(
        firestore()
          .collection("users")
          .doc(parentId)
          .collection("pairedChildren")
          .doc(childUser.uid),
        { 
          name: childName, 
          childId: childUser.uid,
          pairedAt: firestore.FieldValue.serverTimestamp()
        }
      );
      
      batch.update(firestore().collection("Children").doc(childUser.uid), {
        parentId,
        paired: true,
        pairedAt: firestore.FieldValue.serverTimestamp()
      });
  
      await batch.commit();
  
      Alert.alert("Success", "App connected successfully!");
      navigation.navigate("DrawerNavigator", { screen: "Information" });
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to connect. Please try again.");
      console.error("Pairing error:", error);
    }
  };
 
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Connect Parent Account</Text>
      </View>
      
      <View style={styles.content}>
        <Image 
          source={require("../assets/Display.png")} 
          style={styles.image} 
        />
        
        <Text style={styles.instructions}>
          Enter the 4-digit verification code from your parent's dashboard to connect accounts
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter 4-digit code"
            style={styles.input}
            value={manualCode}
            onChangeText={setManualCode}
            keyboardType="numeric"
            maxLength={4}
            placeholderTextColor="#999"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleManualEntry}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Connect Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    backgroundColor: "#00C18D",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 30,
    resizeMode: "contain",
  },
  instructions: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 18,
    fontSize: 18,
    textAlign: "center",
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: "#00C18D",
    borderRadius: 12,
    padding: 18,
    width: "100%",
    alignItems: "center",
    shadowColor: "#00C18D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default ConnectApp;