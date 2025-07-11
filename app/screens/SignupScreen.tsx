import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Picker } from '@react-native-picker/picker';

const CLASS_OPTIONS = ['CLS6', 'CLS7', 'CLS8', 'CLS9', 'CLS10', 'CLS11-MPC', 'CLS12-MPC', 'CLS11-BIPC', 'CLS12-BIPC'];

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentClass, setStudentClass] = useState('CLS6');
  const [loading, setLoading] = useState(false);

  const isValidIndianPhone = (phone: string) => {
    const phoneRegex = /^[6789]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (!isValidIndianPhone(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Indian phone number');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      
      const response = await fetch('https://apdjq7fpontm374bg3p2w3gx3m0hcbwy.lambda-url.us-east-1.on.aws/students/register', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: JSON.stringify({
          email,
          name,
          phoneNumber,
          studentClass
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to register student');
      }
      
      const result = await response.json();
      console.log('Registration result:', result);
      
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>🎓 Create Account</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>👤 Full Name</Text>
          <TextInput
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>📧 Email Address</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>📱 Phone Number (Indian)</Text>
          <TextInput
            placeholder="Enter 10-digit mobile number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={[
              styles.input,
              phoneNumber && !isValidIndianPhone(phoneNumber) && styles.inputError
            ]}
            keyboardType="phone-pad"
            maxLength={10}
          />
          {phoneNumber && !isValidIndianPhone(phoneNumber) && (
            <Text style={styles.errorText}>❌ Invalid Indian phone number</Text>
          )}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>🔒 Password</Text>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>🔐 Confirm Password</Text>
          <TextInput
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>🎓 Student Class</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={studentClass}
              onValueChange={setStudentClass}
              style={styles.picker}
            >
              {CLASS_OPTIONS.map((cls) => (
                <Picker.Item key={cls} label={cls} value={cls} />
              ))}
            </Picker>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.button,
            (loading || !isValidIndianPhone(phoneNumber)) && styles.buttonDisabled
          ]}
          onPress={handleSignup}
          disabled={loading || !isValidIndianPhone(phoneNumber)}
        >
          {loading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.buttonText}>Creating Account...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.buttonEmoji}>🎉</Text>
              <Text style={styles.buttonText}>Create Account</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>
            Already have an account?
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              {' '}Sign In
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 16,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingVertical: 12,
    marginTop: 16,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonEmoji: {
    fontSize: 18,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
    fontSize: 16,
  },
  link: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});