import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useFirebase } from '../context/Firebase';
import auth from '@react-native-firebase/auth';

const CustomDrawer = (props) => {
  const { unpairChild } = useFirebase();

  const handleUnpair = async () => {
    Alert.alert(
      "Unpair Device",
      "This will disconnect your child's device from your account",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm Unpair", 
          onPress: async () => {
            try {
              const currentUser = auth().currentUser;
              if (!currentUser) return;
              await unpairChild(currentUser.uid);
              props.navigation.navigate("Login");
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Child Menu</Text>
      </View>
      
      <DrawerContentScrollView {...props}>
        <DrawerItemList 
          {...props} 
          activeTintColor="#2E7D32"
          inactiveTintColor="#333"
          labelStyle={styles.drawerLabel}
        />
      </DrawerContentScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.unpairButton}
          onPress={handleUnpair}
        >
          <Text style={styles.unpairText}>Unpair Device</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
  },
  drawerLabel: {
    fontSize: 16,
    marginLeft: -16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  unpairButton: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    alignItems: 'center',
  },
  unpairText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomDrawer;