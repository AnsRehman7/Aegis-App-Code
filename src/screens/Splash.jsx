import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Image } from 'react-native';

const Splash = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, navigation]);

  return (
    <View style={styles.container}>
      {/* Top Section with Title */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome To AEGiS</Text>
      </View>

      {/* Middle Section with Image & Animated Content */}
      <View style={styles.content}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Image source={require('../assets/Display.png')} style={styles.image} />
          <Text style={styles.title}>AEGIS</Text>
          <Text style={styles.subtitle}>Managed By Parent</Text>
        </Animated.View>
      </View>

    
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00C18D', // Green Background
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 3,
    backgroundColor: '#EAF9F1', // Light Greenish Background
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#000',
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  
});
