import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

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
      <Text style={styles.title}>🎓 GradeUp</Text>
      <Text style={styles.subtitle}>MCQ Quiz App</Text>
      <ActivityIndicator 
        size="large" 
        color="#4CAF50" 
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});