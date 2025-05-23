import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useFirebase } from '../context/Firebase';

export default function ContentFilteringScreen() {
  const { getParentIdFromFirestore, useBlockedUrlsListener } = useFirebase();
  const [parentId, setParentId] = useState(null);
  const [loadingParent, setLoadingParent] = useState(true);
  const blockedUrls = useBlockedUrlsListener(parentId);

 useEffect(() => {
  const fetchParentId = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.error("No authenticated child user found");
        setLoadingParent(false);
        return;
      }

      const childId = currentUser.uid; // ✅ Get child UID
      const fetchedParentId = await getParentIdFromFirestore(childId); // ✅ Use childId here
      setParentId(fetchedParentId);
    } catch (error) {
      console.error('Error fetching parent ID:', error);
    } finally {
      setLoadingParent(false);
    }
  };

  fetchParentId();
}, []);
  const formatUrlForDisplay = (url) => {
    return url.replace(/_/g, '.').replace(/^www_/, 'www.');
  };

  const renderUrlItem = ({ item }) => (
    <View style={styles.urlItem}>
      <Text style={styles.urlText}>{formatUrlForDisplay(item)}</Text>
    </View>
  );


  if (loadingParent) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!parentId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Parent account not found for this child</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Content Filtering</Text>
      <Text style={styles.text}>
        Websites blocked from the parent portal will be automatically restricted.
      </Text>

      <Text style={styles.subtitle}>Currently Blocked Websites:</Text>
      
      {blockedUrls === null ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : blockedUrls.length === 0 ? (
        <Text style={styles.emptyText}>No websites currently blocked</Text>
      ) : (
        <FlatList
          data={blockedUrls}
          renderItem={renderUrlItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
        />
      )}
    </View>
  );
}
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  urlItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderRadius: 8,
  },
  urlText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});