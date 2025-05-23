import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useFirebase } from "../context/Firebase";
import auth from "@react-native-firebase/auth";

const Information = () => {
  const { getChildInfo } = useFirebase();
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChildInfo = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) throw new Error("No user logged in");
        const data = await getChildInfo(currentUser.uid);
        setChildData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChildInfo();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Child Information</Text>
        
        <View style={styles.infoCard}>
          <InfoRow label="Name" value={childData?.name || childData?.Name || "Not set"} />
          <InfoRow label="Email" value={childData?.email || "Not set"} />
          <InfoRow label="Mobile Number" value={childData?.mobileNumber || "Not set"} />
          <InfoRow label="Age" value={childData?.age || "Not set"} />
          {childData?.parentId && (
            <InfoRow label="Parent ID" value={childData.parentId} />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  label: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Information;