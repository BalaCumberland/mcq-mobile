import React, { useState, memo, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  ScrollView,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { auth } from '../config/firebase';
import userStore from '../store/UserStore';
import { resendVerifiedEmail } from '../services/firebaseAuth';
import { designSystem, colors, spacing, borderRadius } from '../styles/designSystem';

const { width } = Dimensions.get('window');

const LoginScreen = memo(function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      // Silent fail
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        BackHandler.exitApp();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
      return () => backHandler.remove();
    }, [])
  );

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleResendEmail = async () => {
    try {
      await resendVerifiedEmail();
      Alert.alert(
        'Verification Email Sent',
        "We've sent a verification link to your email.\n\n💡 Please also check your spam/junk folder."
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to resend verification email. Please try again.'
      );
    }
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert('Missing Details', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address to access the app.\n\nIf you cannot find the email, check spam/junk or request a new link.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Resend Email', onPress: handleResendEmail },
          ]
        );
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem('savedEmail', rememberMe ? trimmedEmail : '');
      await AsyncStorage.setItem('savedPassword', rememberMe ? password : '');

      const response = await userStore.getState().fetchUserByEmail(trimmedEmail);
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error?.message || 'Unable to sign in. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>🌐 Exam Sphere</Text>
          <Text style={styles.subtitle}>Master your knowledge</Text>
        </View>

        {/* Form Section */}
        <KeyboardAvoidingView
          style={styles.formWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.formCard}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.description}>
              Sign in to continue your learning journey
            </Text>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    placeholder="you@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>
              </View>

              {/* Remember me + forgot password */}
              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked,
                    ]}
                  >
                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.buttonText}>Signing in...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Signup */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>
                  Don&apos;t have an account?{' '}
                  <Text
                    style={styles.signupLink}
                    onPress={() => navigation.navigate('Signup')}
                  >
                    Sign up
                  </Text>
                </Text>
              </View>
            </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  header: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: spacing.lg,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  formWrapper: {
    flex: 0.7,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
  },

  inputContainer: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#64748B',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 12,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  signupContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 10,
  },
  signupText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signupLink: {
    color: '#1e3a8a',
    fontWeight: '700',
  },
});

export default LoginScreen;
