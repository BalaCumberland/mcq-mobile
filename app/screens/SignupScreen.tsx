import React, { useState, memo, useCallback, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Picker } from '@react-native-picker/picker';
import ApiService from '../services/apiService';

const SignupScreen = memo(function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const data = await ApiService.getClassesPublic();
        setClasses(Array.isArray(data) ? data : []);
        if (data && data.length > 0) {
          setStudentClass(data[0]);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const isValidIndianPhone = useCallback((phone: string) => {
    const phoneRegex = /^[6789]\d{9}$/;
    return phoneRegex.test(phone);
  }, []);

  const sanitizeInput = (input: string) => {
    return input.trim().replace(/[<>"'&]/g, '');
  };

  const handleSignup = useCallback(async () => {
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send email verification (no actionCodeSettings needed for React Native)
      const { sendEmailVerification } = await import('firebase/auth');
      try {
        await sendEmailVerification(user);
        console.log('✅ Verification email sent via Firebase');
      } catch (emailError: any) {
        console.warn('⚠️ Firebase email failed:', emailError.message);
      }
      
      const result = await ApiService.registerStudent({
        uid: user.uid,
        email: sanitizeInput(email),
        name: sanitizeInput(name),
        phoneNumber: sanitizeInput(phoneNumber),
        studentClass: sanitizeInput(studentClass)
      });
      console.log('Registration result:', result);
      
      Alert.alert(
        'Registration Successful!',
        'Account created successfully!\n\nCheck your email including spam/junk folder to verify your account.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]
      );
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  }, [email, name, phoneNumber, password, confirmPassword, studentClass, navigation, isValidIndianPhone]);

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
          {loadingClasses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading classes...</Text>
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={studentClass}
                onValueChange={setStudentClass}
                style={styles.picker}
              >
                <Picker.Item label="Select class..." value="" />
                {classes.map((cls) => (
                  <Picker.Item key={cls} label={cls} value={cls} />
                ))}
              </Picker>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={[
            styles.button,
            (loading || !isValidIndianPhone(phoneNumber) || !studentClass) && styles.buttonDisabled
          ]}
          onPress={handleSignup}
          disabled={loading || !isValidIndianPhone(phoneNumber) || !studentClass}
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
});

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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontSize: 14,
  },
});

export default SignupScreen;