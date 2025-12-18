import React, { useState, memo, useCallback, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator, ScrollView, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Picker } from '@react-native-picker/picker';
import ApiService from '../services/apiService';
import { designSystem, colors, spacing, borderRadius } from '../styles/designSystem';

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>🎓 GradeUp</Text>
        <Text style={styles.subtitle}>Join the learning community</Text>
      </View>
      
      {/* Form Section */}
      <View style={styles.formSection}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.description}>Start your learning journey today</Text>
        
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                placeholder="Full name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
          </View>
        
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>
        
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, phoneNumber && !isValidIndianPhone(phoneNumber) && styles.inputError]}>
              <Text style={styles.inputIcon}>📱</Text>
              <TextInput
                placeholder="Phone number (10 digits)"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {phoneNumber && !isValidIndianPhone(phoneNumber) && (
              <Text style={styles.errorText}>Invalid phone number</Text>
            )}
          </View>
        
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                secureTextEntry
              />
            </View>
          </View>
        
          <View style={styles.inputContainer}>
            {loadingClasses ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1e40af" />
                <Text style={styles.loadingText}>Loading classes...</Text>
              </View>
            ) : (
              <View style={styles.pickerContainer}>
                <Text style={styles.inputIcon}>🎓</Text>
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
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Already have an account?{' '}
              <Text style={styles.signupLink} onPress={() => navigation.navigate('Login')}>
                Sign In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  header: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#cbd5e1',
    fontWeight: '400',
  },
  formSection: {
    flex: 0.8,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#64748b',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    paddingVertical: 16,
    fontWeight: '400',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  picker: {
    flex: 1,
    height: 50,
  },
  button: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  signupContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    marginTop: 20,
  },
  signupText: {
    fontSize: 15,
    color: '#64748b',
  },
  signupLink: {
    color: '#1e40af',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#64748b',
  },
});

export default SignupScreen;