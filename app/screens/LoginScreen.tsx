import React, { useState, memo } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import userStore from '../store/UserStore';
import { resendVerifiedEmail } from '../services/firebaseAuth';
import { designSystem, colors, spacing, borderRadius } from '../styles/designSystem';

const LoginScreen = memo(function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleResendEmail = async () => {
    try {
      await resendVerifiedEmail();
      Alert.alert(
        'Email Sent',
        'Verification email sent! Check your inbox.\n\n💡 Check spam/junk folder if you don\'t see it.'
      );
    } catch (error: any) {
      console.error('Resend email error:', error);
      Alert.alert('Error', error.message || 'Failed to resend verification email');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (!user.emailVerified) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address to access the application.\n\nCheck including spam/junk folder and verify your account before logging in.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Resend Email', onPress: handleResendEmail }
          ]
        );
        setLoading(false);
        return;
      }
      
      const response = await userStore.getState().fetchUserByEmail(email);
      console.log(response);
      Alert.alert('Login Success', `Welcome back, ${response.email}`);
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        
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
          <Text style={styles.label}>🔒 Password</Text>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.buttonText}>Signing In...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.buttonEmoji}>✨</Text>
              <Text style={styles.buttonText}>Sign In</Text>
            </View>
          )}
        </TouchableOpacity>
        
      </View>
      
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Don't have an account?
          <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
            {' '}Sign Up
          </Text>
        </Text>
        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotButton}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  formContainer: {
    ...designSystem.cardElevated,
  },
  title: {
    ...designSystem.headingLarge,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
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
  button: {
    ...designSystem.buttonSecondary,
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
    paddingHorizontal: spacing.xl,
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
  forgotButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
});

export default LoginScreen;
