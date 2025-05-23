import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
  } from 'react-native';
  import React, { useState } from 'react';
  
  const ForgetPassword = ({ navigation }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
  
    const handleSubmit = () => {
      if (!newPassword.trim() || !confirmPassword.trim()) {
        setError('Both fields are required.');
      } else if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
      } else {
        setError('');
        console.log('Password reset successful');
        navigation.navigate('PasswordSplash');
      }
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>New Password</Text>
        </View>
  
        <View style={styles.bottomSection}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            placeholder="***********"
            placeholderTextColor="#9DA3A4"
            style={styles.input}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
  
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            placeholder="************"
            placeholderTextColor="#9DA3A4"
            style={styles.input}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
  
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
  
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };
  

  
export default ForgetPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00C18D',
    },
    header: {
        height:200,
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
        paddingTop: 30,
        backgroundColor: '#EAF9F1',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 25,
      },
      input: {
      
        backgroundColor: '#D5EEDA',
        padding: 12,
        borderRadius: 25,
        color: '#000',
        fontSize: 14,
      },
      label: {
        marginTop:10,
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
        marginBottom: 5,
      },
      errorText: {
        color: 'red',
        marginTop: 10,
        fontSize: 14,
      },
      button: {
        backgroundColor: '#00C18D',
        padding: 12,
        borderRadius: 25,
        marginTop: 20,
      },
      buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
      },
      
})