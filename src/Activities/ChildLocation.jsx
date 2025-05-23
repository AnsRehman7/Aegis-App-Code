import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, PermissionsAndroid, Alert, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { startLocationService, stopLocationService } from './LocationService';

const ChildLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let watchId = null;

    const initLocation = async () => {
      try {
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert('Permission Denied', 'Location permission is required');
          return;
        }

        // Start the foreground service
        startLocationService();

        // First try to get current position quickly
        Geolocation.getCurrentPosition(
          position => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          err => {
            console.log('Initial position error:', err);
            setError(err.message);
          },
          { enableHighAccuracy: false, timeout: 50000, maximumAge: 0 }
        );

        // Then set up continuous updates
        watchId = Geolocation.watchPosition(
          position => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            setError(null);
          },
          err => {
            console.log('Watch position error:', err);
            setError(err.message);
          },
          { 
            enableHighAccuracy: false, 
            distanceFilter: 10,
            interval: 5000,
            fastestInterval: 2000
          }
        );

      } catch (err) {
        console.log('Location error:', err);
        setError(err.message);
      }
    };

    initLocation();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
      stopLocationService();
    };
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      return (
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ||
        granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (e) {
      console.warn(e);
      return false;
    }
  };

  return (
    <View style={styles.container}>
      {location ? (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            showsUserLocation={true}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title="Child Location"
              description="This is your child"
              pinColor="red"
            />
          </MapView>
          <View style={styles.coordsContainer}>
            <Text style={styles.coordText}>Latitude: {location.latitude.toFixed(6)}</Text>
            <Text style={styles.coordText}>Longitude: {location.longitude.toFixed(6)}</Text>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          {error ? (
            <Text style={styles.errorText}>Error: {error}</Text>
          ) : (
            <>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Fetching live location...</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  coordsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 8,
  },
  coordText: { color: 'black', fontSize: 14 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: {
    marginTop: 10,
    color: 'black',
    fontSize: 16
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20
  }
});

export default ChildLocation;