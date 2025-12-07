import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import QuizScreen from './screens/QuizScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';

import useUserStore from './store/UserStore';

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
    backgroundColor: '#4CAF50',
  },
  progressButton: {
    backgroundColor: '#9C27B0',
  },
  profileButton: {
    backgroundColor: '#FF5722',
  },
  logoutButton: {
    backgroundColor: '#FF9800',
  },
  buttonEmoji: {
    fontSize: 20,
  },
};

export default function AppNavigator() {
  const { user } = useUserStore();

  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={({ navigation, route }) => ({
          headerLeft: () => null,
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#333',
          },
          headerTitle: route.name === 'Login' ? '🎓 GradeUp' : route.name === 'Signup' ? '🎓 Sign Up' : '🎓 GradeUp',
          headerRight: route.name !== 'Login' && route.name !== 'Signup' ? () => (
            <View style={navStyles.headerRight}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Home')}
                style={[navStyles.iconButton, navStyles.homeButton]}
              >
                <Text style={navStyles.buttonEmoji}>🏠</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Progress')}
                style={[navStyles.iconButton, navStyles.progressButton]}
              >
                <Text style={navStyles.buttonEmoji}>📊</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Profile')}
                style={[navStyles.iconButton, navStyles.profileButton]}
              >
                <Text style={navStyles.buttonEmoji}>👤</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={async () => {
                  try {
                    await signOut(auth);
                    navigation.navigate('Login');
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}
                style={[navStyles.iconButton, navStyles.logoutButton]}
              >
                <Text style={navStyles.buttonEmoji}>⏻</Text>
              </TouchableOpacity>
            </View>
          ) : undefined,
        })}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
