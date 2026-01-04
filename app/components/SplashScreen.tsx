import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Logo from './Logo';

interface SplashScreenProps {
  onInitialized: () => void;
}

export default function SplashScreen({ onInitialized }: SplashScreenProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Minimum splash time to ensure proper initialization
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Additional initialization checks can go here
        // e.g., check network connectivity, validate Firebase, etc.
        
        setIsLoading(false);
        onInitialized();
      } catch (error) {
        // Still proceed to avoid infinite loading
        setIsLoading(false);
        onInitialized();
      }
    };

    initializeApp();
  }, [onInitialized]);

  return (
    <View style={styles.container}>
      <Logo size="large" color="dark" />
      <Text style={styles.subtitle}>MCQ Quiz App</Text>
      <ActivityIndicator 
        size="large" 
        color="#1e40af" 
        style={styles.loader}
      />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 40,
    marginTop: 8,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
});