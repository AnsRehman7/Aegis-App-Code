import React, { useState } from 'react';
import {useFirebase} from '../context/Firebase'; // Import the Firebase context
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator, // For user feedback on incomplete forms
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const Signup = ({ navigation }) => {
  const { SignupChild } = useFirebase(); // Destructure the SignupChild function from Firebase context
  const [formData, setFormData] = useState({
    name: '',  // changed from Name
    email: '',
    mobileNumber: '',
    age: '',
    password: '',
    confirmPassword: '',
  });
  
  

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); // State to manage loading status

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    const { name, email, mobileNumber, age, password, confirmPassword } = formData;

    setLoading(true);
    // Simulate login logic
    setTimeout(() => {
      setLoading(false);
      console.log("Logged in!");
    }, 2000); // Replace with actual login logic


    // Check if all fields are filled
    if (!name || !email || !mobileNumber || !age || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

     // Validate passwords
     if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try{
       // Call Firebase signup function
       await SignupChild(email, password, { name, age, mobileNumber, confirmPassword });
       Alert.alert("Success", "Account created successfully!");
      navigation.navigate("ConnectApp");
     } catch (error) {
       Alert.alert("Error", error.message);
     }
    }


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Create Account</Text>
      </View>

      {/* Form Section */}
      <ScrollView
        style={styles.bottomSection}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          placeholder="Child Name"
          placeholderTextColor="#9DA3A4"
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
          keyboardType="default" // Specifies text input
          required // Ensures field is required
        />

        <Text style={styles.label}>Enter Email</Text>
        <TextInput
          placeholder="example@example.com"
          placeholderTextColor="#9DA3A4"
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address" // Specifies email input
          required
        />

        <Text style={styles.label}>Parents Mobile Number</Text>
        <TextInput
          placeholder="+123 456 789"
          placeholderTextColor="#9DA3A4"
          style={styles.input}
          value={formData.mobileNumber}
          onChangeText={(value) => handleChange('mobileNumber', value)}
          keyboardType="phone-pad" // Specifies numeric keypad for phone numbers
          required
        />

        <Text style={styles.label}>Enter Age</Text>
        <TextInput
          placeholder="12"
          placeholderTextColor="#9DA3A4"
          style={styles.input}
          value={formData.age}
          onChangeText={(value) => handleChange('age', value)}
          keyboardType="numeric" // Specifies number input
          required
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#9DA3A4"
            secureTextEntry={!showPassword}
            style={styles.inputPassword}
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            required
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#3E3E3E" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#9DA3A4"
            secureTextEntry={!showConfirmPassword}
            style={styles.inputPassword}
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            required
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#3E3E3E" />
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          By continuing, you agree to <Text style={styles.bold}>Terms of Use and Privacy Policy.</Text>
        </Text>

         <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleSubmit} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginText}>SignUp</Text>
              )}
            </TouchableOpacity>

        <Text style={styles.bottomText}>
          Already have an account?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Log In
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00C18D',
  },
  header: {
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  bottomSection: {
    flex: 4,
    backgroundColor: '#EAF9F1',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 25,
  },
  label: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    marginTop: 15,
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
  },
  inputPassword: {
    flex: 1,
    color: '#000',
    fontSize: 14,
  },
  terms: {
    marginTop: 15,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#00C18D',
    padding: 14,
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 12,
    color: '#000',
  },
  link: {
    color: '#007BFF',
  },
});
