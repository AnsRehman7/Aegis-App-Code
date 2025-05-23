import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const LockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState('');

 // Update handleAccept
const handleAccept = async () => {
    const childId = auth().currentUser?.uid;
    if (!childId) return;

    try {
        const doc = await firestore().collection('Children').doc(childId).get();
        const storedPin = doc.data()?.unlockCode;
        
        if (pin === storedPin) {
            await firestore().collection('Children').doc(childId).update({ locked: false });
            navigation.goBack();
        } else {
            Alert.alert('Incorrect Pin', 'Please try again.');
            setPin('');
        }
    } catch (error) {
        Alert.alert('Error', 'Failed to verify PIN');
    }
};

  const handleSendAgain = () => {
    Alert.alert('PIN Sent Again', 'The parent security PIN has been sent again.');
  };

  const renderCircles = () => {
    return (
      <View style={styles.circlesContainer}>
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <View
              key={index}
              style={[
                styles.circle,
                pin.length > index && styles.filledCircle,
              ]}
            >
              <Text style={styles.digit}>{pin[index] || ''}</Text>
            </View>
          ))}
      </View>
    );
  };

  const handleChange = (value) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setPin(value);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Security Pin</Text>
      <View style={styles.box}>
        <Text style={styles.label}>Enter Security Pin</Text>
        {renderCircles()}
        <TextInput
          value={pin}
          onChangeText={handleChange}
          keyboardType="number-pad"
          style={styles.hiddenInput}
          maxLength={6}
          autoFocus
        />
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendAgainButton} onPress={handleSendAgain}>
          <Text style={styles.sendAgainText}>Send Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LockScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00C58E',
    alignItems: 'center',
    paddingTop: 60,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  box: {
    marginTop: 40,
    width: '90%',
    backgroundColor: '#EAF9F1',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00C58E',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  filledCircle: {
    backgroundColor: '#EAF9F1',
  },
  digit: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  hiddenInput: {
    height: 0,
    width: 0,
    opacity: 0,
  },
  acceptButton: {
    backgroundColor: '#00C58E',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 20,
    marginBottom: 10,
  },
  acceptText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sendAgainButton: {
    backgroundColor: '#CFEDE3',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  sendAgainText: {
    color: '#444',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    fontSize: 13,
    color: '#000',
  },
  signup: {
    color: '#4D9CF0',
    fontWeight: 'bold',
  },
});
