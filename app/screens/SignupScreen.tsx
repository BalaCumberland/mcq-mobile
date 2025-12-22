import React, { useState, memo, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';
import { auth } from '../config/firebase';
import ApiService from '../services/apiService';

const { width } = Dimensions.get('window');

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
      } catch (error) {
        setClasses([]);
        Alert.alert('Error', 'Failed to load classes. Please try again later.');
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

  const isValidEmail = useCallback((value: string) => {
    if (!value) return false;
    // basic email check
    return /\S+@\S+\.\S+/.test(value.trim());
  }, []);

  const sanitizeInput = (input: string) => {
    return input.trim().replace(/[<>"'&]/g, '');
  };

  const handleSignup = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!isValidIndianPhone(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Indian phone number');
      return;
    }

    if (!studentClass) {
      Alert.alert('Error', 'Please select your class');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      // Send email verification
      try {
        await sendEmailVerification(user);
      } catch (emailError: any) {
      }

      const result = await ApiService.registerStudent({
        uid: user.uid,
        email: sanitizeInput(trimmedEmail),
        name: sanitizeInput(trimmedName),
        phoneNumber: sanitizeInput(phoneNumber),
        studentClass: sanitizeInput(studentClass),
      });

      Alert.alert(
        'Registration Successful!',
        'Account created successfully.\n\nPlease check your email (including spam/junk folder) to verify your account.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    name,
    email,
    phoneNumber,
    password,
    confirmPassword,
    studentClass,
    navigation,
    isValidEmail,
    isValidIndianPhone,
  ]);

  const phoneInvalid = phoneNumber.length > 0 && !isValidIndianPhone(phoneNumber);
  const emailInvalid = email.length > 0 && !isValidEmail(email);

  const isButtonDisabled =
    loading ||
    !name.trim() ||
    !email.trim() ||
    !password ||
    !confirmPassword ||
    !studentClass ||
    phoneInvalid ||
    emailInvalid ||
    password.length < 6 ||
    password !== confirmPassword;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>🌐 Exam Sphere</Text>
          <Text style={styles.subtitle}>Join the learning community</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.description}>Start your learning journey today</Text>

            {/* Name */}
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

            {/* Email */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  emailInvalid && styles.inputError,
                ]}
              >
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
              {emailInvalid && (
                <Text style={styles.errorText}>Invalid email address</Text>
              )}
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  phoneInvalid && styles.inputError,
                ]}
              >
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
              {phoneInvalid && (
                <Text style={styles.errorText}>Invalid Indian phone number</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  placeholder="Password (min 6 characters)"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry
                />
              </View>
              {password.length > 0 && password.length < 6 && (
                <Text style={styles.errorText}>Password is too short</Text>
              )}
            </View>

            {/* Confirm Password */}
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
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
            </View>

            {/* Class Picker */}
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

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isButtonDisabled}
              activeOpacity={0.9}
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

            {/* Footer: already have account */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                Already have an account?{' '}
                <Text
                  style={styles.signupLink}
                  onPress={() => navigation.navigate('Login')}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
});

export default SignupScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  container: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  header: {
    flex: 0.22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#cbd5e1',
    fontWeight: '400',
  },
  formSection: {
    flex: 0.78,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
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
    paddingVertical: 12,
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
    borderRadius: 14,
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
    columnGap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
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
    fontWeight: '700',
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
    fontSize: 14,
  },
});
