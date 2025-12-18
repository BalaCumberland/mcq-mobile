import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View, Alert } from 'react-native';
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

const navStyles = {
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    elevation: 2,
  },
  homeButton: {
    backgroundColor: '#059669',
  },
  progressButton: {
    backgroundColor: '#7c3aed',
  },
  profileButton: {
    backgroundColor: '#dc2626',
  },
  logoutButton: {
    backgroundColor: '#ea580c',
  },
  buttonEmoji: {
    fontSize: 20,
  },
};

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
          headerLeft: route.name === 'Review' ? undefined : () => null,
          gestureEnabled: route.name === 'Review',
          headerRight: route.name !== 'Login' && route.name !== 'Signup' && route.name !== 'ForgotPassword' ? () => (
            <View style={navStyles.headerRight}>
              <TouchableOpacity 
                onPress={() => {
                  if (hasActiveQuiz()) {
                    Alert.alert(
                      'Leave Quiz?',
                      'You have an active quiz. Your progress will be lost if you leave.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Leave', onPress: () => navigation.navigate('Home') }
                      ]
                    );
                  } else {
                    navigation.navigate('Home');
                  }
                }}
                style={[navStyles.iconButton, navStyles.homeButton]}
              >
                <Text style={navStyles.buttonEmoji}>🏠</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  if (hasActiveQuiz()) {
                    Alert.alert(
                      'Leave Quiz?',
                      'You have an active quiz. Your progress will be lost if you leave.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Leave', onPress: () => navigation.navigate('Progress') }
                      ]
                    );
                  } else {
                    navigation.navigate('Progress');
                  }
                }}
                style={[navStyles.iconButton, navStyles.progressButton]}
              >
                <Text style={navStyles.buttonEmoji}>📊</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  if (hasActiveQuiz()) {
                    Alert.alert(
                      'Leave Quiz?',
                      'You have an active quiz. Your progress will be lost if you leave.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Leave', onPress: () => navigation.navigate('Profile') }
                      ]
                    );
                  } else {
                    navigation.navigate('Profile');
                  }
                }}
                style={[navStyles.iconButton, navStyles.profileButton]}
              >
                <Text style={navStyles.buttonEmoji}>👤</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={async () => {
                  Alert.alert(
                    hasActiveQuiz() ? 'Logout During Quiz?' : 'Logout',
                    hasActiveQuiz() 
                      ? 'You have an active quiz. Your progress will be lost if you logout.' 
                      : 'Are you sure you want to logout?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Logout', onPress: async () => {
                        try {
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
                }}
                style={[navStyles.iconButton, navStyles.logoutButton]}
              >
                <Text style={navStyles.buttonEmoji}>📴</Text>
              </TouchableOpacity>
            </View>
          ) : undefined,
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
