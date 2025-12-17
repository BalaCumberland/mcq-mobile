import React, { useState, memo, useCallback, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
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
        
      </View>
      
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Already have an account?
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            {' '}Sign In
          </Text>
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  formContainer: {
    ...designSystem.cardElevated,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
  title: {
    ...designSystem.headingLarge,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    ...designSystem.formLabel,
  },
  input: {
    ...designSystem.formInput,
  },
  inputError: {
    borderColor: colors.error[500],
  },
  errorText: {
    color: colors.error[500],
    fontSize: 12,
    marginTop: spacing.xs,
  },
  pickerContainer: {
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.lg,
  },
  picker: {
    height: 48,
  },
  button: {
    ...designSystem.buttonPurple,
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    ...designSystem.buttonDisabled,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    ...designSystem.buttonText,
  },
  buttonEmoji: {
    fontSize: 20,
  },
  linkContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: '#f8fafc',
    paddingVertical: spacing.lg,
  },
  linkText: {
    ...designSystem.bodyMedium,
  },
  link: {
    color: colors.secondary[600],
    fontWeight: '600',
  },
  loadingContainer: {
    ...designSystem.loadingContainer,
  },
  loadingText: {
    ...designSystem.loadingText,
    color: colors.purple[500],
  },
});

export default SignupScreen;