import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator, // For user feedback on incomplete forms
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useFirebase } from '../context/Firebase'; // Import the Firebase context

const Login = ({ navigation }) => {
  const { LoginWithEmail } = useFirebase(); // Access Firebase login function
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleLogin = async () => {

      setLoading(true);
      // Simulate login logic
      setTimeout(() => {
        setLoading(false);
        console.log("Logged in!");
      }, 2000); // Replace with actual login logic


    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      // Call Firebase login function
      const user = await LoginWithEmail(email, password);
      Alert.alert('Success', 'Logged in successfully!');
      navigation.navigate('ConnectApp'); 
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message); // Show Firebase error message
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Green Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome</Text>
      </View>

      {/* Bottom White Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.label}>Username Or Email</Text>
        <TextInput
          placeholder="example@example.com"
          placeholderTextColor="#9DA3A4"
          style={styles.input}
          value={email}
          onChangeText={(value) => setEmail(value)}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#9DA3A4"
            secureTextEntry={!showPassword}
            style={styles.inputPassword}
            value={password}
            onChangeText={(value) => setPassword(value)}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#3E3E3E"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
      style={styles.loginButton} 
      onPress={handleLogin} 
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.loginText}>Log In</Text>
      )}
    </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          Don't have an Account?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Signup')}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00C18D',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  bottomSection: {
    flex: 3,
    backgroundColor: '#EAF9F1',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
  },
  label: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#D5EEDA',
    padding: 12,
    borderRadius: 25,
    color: '#000',
    fontSize: 14,
  },
  passwordContainer: {
    backgroundColor: '#D5EEDA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 10,
  },
  inputPassword: {
    flex: 1,
    color: '#000',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#00C18D',
    padding: 14,
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  forgot: {
    color: '#333',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
  },
  bottomText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
    color: '#000',
  },
  link: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});
