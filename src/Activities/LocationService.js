import { NativeModules, Platform } from "react-native";
import auth from "@react-native-firebase/auth";

const { LocationServiceModule } = NativeModules;

export const startLocationService = () => {
  const childId = auth().currentUser?.uid;
  if (!childId) {
    console.warn("No logged-in user found");
    return;
  }

  // ✅ Call native module to start service and save childId
  if (Platform.OS === "android") {
    LocationServiceModule.startServiceWithChildId(childId);
  }
};

export const stopLocationService = () => {
  if (Platform.OS === "android") {
    LocationServiceModule.stopService();
  }
};
