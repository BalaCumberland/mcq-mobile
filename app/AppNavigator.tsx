import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View, Alert, Modal, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ReviewScreen from './screens/ReviewScreen';
import HomeScreen from './screens/HomeScreen';
import QuizScreen from './screens/QuizScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';

import useUserStore from './store/UserStore';
import useQuizStore from './store/QuizStore';

const Stack = createStackNavigator();

const HamburgerMenu = ({ navigation, hasActiveQuiz }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const navigateWithQuizCheck = (screenName) => {
    if (hasActiveQuiz()) {
      Alert.alert(
        'Leave Quiz?',
        'You have an active quiz. Your progress will be lost if you leave.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', onPress: () => {
            setIsMenuVisible(false);
            navigation.navigate(screenName);
          }}
        ]
      );
    } else {
      setIsMenuVisible(false);
      navigation.navigate(screenName);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      hasActiveQuiz() ? 'Logout During Quiz?' : 'Logout',
      hasActiveQuiz() 
        ? 'You have an active quiz. Your progress will be lost if you logout.' 
        : 'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          try {
            setIsMenuVisible(false);
            await signOut(auth);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Logout error:', error);
          }
        }}
      ]
    );
  };

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsMenuVisible(true)}
        style={styles.hamburgerButton}
      >
        <Text style={styles.hamburgerIcon}>☰</Text>
      </TouchableOpacity>
      
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateWithQuizCheck('Home')}
            >
              <Text style={styles.menuIcon}>🏠</Text>
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateWithQuizCheck('Progress')}
            >
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={styles.menuText}>Progress</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateWithQuizCheck('Profile')}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <Text style={styles.menuIcon}>📴</Text>
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  hamburgerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  hamburgerIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginTop: 60,
    marginLeft: 16,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 4,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});

export default function AppNavigator() {
  const { user } = useUserStore();
  const { hasActiveQuiz } = useQuizStore();

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={({ navigation, route }) => ({
          headerLeft: () => null,
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: '#1e40af',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: 0.3,
          },
          headerTitle: route.name === 'Login' ? '🎓 GradeUp' : route.name === 'Signup' ? '🎓 Sign Up' : route.name === 'ForgotPassword' ? '🔒 Reset Password' : route.name === 'Review' ? '📋 Quiz Review' : '🎓 GradeUp',
          headerLeft: route.name !== 'Login' && route.name !== 'Signup' && route.name !== 'ForgotPassword' ? () => (
            <HamburgerMenu navigation={navigation} hasActiveQuiz={hasActiveQuiz} />
          ) : route.name === 'Review' ? undefined : () => null,
          gestureEnabled: route.name === 'Review',
        })}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
