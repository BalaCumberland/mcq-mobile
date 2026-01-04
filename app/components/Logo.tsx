import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', color = 'light' }) => {
  const sizeStyles = {
    small: { fontSize: 24, iconSize: 20 },
    medium: { fontSize: 32, iconSize: 28 },
    large: { fontSize: 40, iconSize: 36 }
  };

  const colorStyles = {
    light: { color: '#ffffff' },
    dark: { color: '#1e40af' }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={[styles.icon, { fontSize: sizeStyles[size].iconSize }]}>🎓</Text>
        <Text style={[
          styles.text, 
          { fontSize: sizeStyles[size].fontSize },
          colorStyles[color]
        ]}>
          ExamSphere
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    textAlign: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default Logo;