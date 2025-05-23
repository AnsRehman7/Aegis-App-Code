import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  AppState, FlatList, Alert
} from 'react-native';
import { useFirebase } from '../context/Firebase';
import { NativeModules } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const { ScreenTimeModule } = NativeModules;

export default function ScreenTime() {
  const { updateScreenTime } = useFirebase();
  const [screenTime, setScreenTime] = useState(0);
  const [appList, setAppList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPerm, setHasPerm] = useState(false);
  const [error, setError] = useState(null);
  const [dailyLimit, setDailyLimit] = useState(0); // in minutes
  const nav = useNavigation();
  const childId = auth().currentUser?.uid;

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const fetchAndCheck = useCallback(async () => {
    setLoading(true);
    try {
      if (!childId) throw new Error('No child user logged in');
      
      const childDoc = await firestore().collection('Children').doc(childId).get();
      const limitMin = childDoc.data()?.dailyLimitMinutes || 0;
      setDailyLimit(limitMin);

      const { totalScreenTime, appList: apps } = await ScreenTimeModule.getAppUsageStats();
      setScreenTime(totalScreenTime);
      setAppList(apps);

      const today = getTodayDate();
      await updateScreenTime(childId, today, {
        total: totalScreenTime,
        apps: apps.map(a => ({
          name: a.appName,
          package: a.packageName, 
          usageTime: a.usageTime
        })),
        updatedAt: firestore.FieldValue.serverTimestamp()
      });

      if (limitMin && totalScreenTime > limitMin * 60) {
        await firestore().collection('Children').doc(childId).update({ 
          locked: true,
          lastLockedAt: firestore.FieldValue.serverTimestamp() 
        });
        nav.navigate('LockScreen');
      }
    } catch (e) {
      console.error('ScreenTime Error:', e);
      setError(e.message || 'Failed to load screen time');
      Alert.alert('Error', 'Could not load screen time data');
    } finally {
      setLoading(false);
    }
  }, [childId, nav, updateScreenTime]);

  const checkPerm = useCallback(() => {
    ScreenTimeModule.hasUsageAccessPermission(ok => {
      setHasPerm(ok);
      if (ok) fetchAndCheck();
      else setLoading(false);
    });
  }, [fetchAndCheck]);

  useEffect(() => {
    if (childId) ScreenTimeModule.startScreenTimeService(childId);
    return () => ScreenTimeModule.stopScreenTimeService();
  }, [childId]);

  useEffect(() => {
    checkPerm();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') checkPerm();
    });
    return () => sub.remove();
  }, [checkPerm]);

  const remainingTime = dailyLimit ? (dailyLimit * 60) - screenTime : 0;
  const isOverLimit = remainingTime < 0;

  const formatTime = (seconds) => {
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMinutes = (seconds) => {
    return `${Math.floor(seconds / 60)}m`;
  };

  const renderItem = useCallback(({ item }) => (
    <View style={styles.appItem}>
      <Text style={styles.appName}>{item.appName}</Text>
      <Text style={styles.appTime}>
        {item.blocked ? 'Blocked' : formatMinutes(item.usageTime)}
      </Text>
    </View>
  ), []);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
      <Text>Loading screen time...</Text>
    </View>
  );

  if (!hasPerm) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Usage access permission required</Text>
      <Button 
        title="Grant Permission" 
        onPress={() => ScreenTimeModule.openUsageAccessSettings()} 
      />
    </View>
  );

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error}</Text>
      <Button title="Retry" onPress={checkPerm} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Screen Time Overview</Text>
      
      {!isOverLimit ? (
        <Text style={styles.subHeader}>Your daily limit isn't reached yet—stay mindful!</Text>
      ) : (
        <Text style={[styles.subHeader, styles.overLimitText]}>
          You've exceeded your daily screen time limit!
        </Text>
      )}

      <View style={styles.remainingTimeContainer}>
        <Text style={styles.remainingTimeLabel}>Remaining Time</Text>
        <Text style={[styles.remainingTime, isOverLimit && styles.overLimitText]}>
          {formatTime(remainingTime)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalTimeContainer}>
        <Text style={styles.totalTimeLabel}>Total Time Spent Today</Text>
        <Text style={styles.totalTime}>{formatMinutes(screenTime)}</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.breakdownHeader}>Daily Usage Breakdown</Text>
      <FlatList 
        data={appList}
        renderItem={renderItem}
        keyExtractor={item => item.packageName}
        style={styles.appList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No app usage data available</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  remainingTimeContainer: {
    marginBottom: 24,
  },
  remainingTimeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  remainingTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  totalTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  totalTimeLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  breakdownHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  appList: {
    flex: 1,
  },
  appItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  appName: {
    fontSize: 16,
    color: '#333',
  },
  appTime: {
    fontSize: 16,
    color: '#666',
  },
  overLimitText: {
    color: '#e53935',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
});