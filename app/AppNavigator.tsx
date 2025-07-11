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
import AdminScreen from './screens/AdminScreen';
import useUserStore from './store/UserStore';

const Stack = createStackNavigator();

const navStyles = {
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 16,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    elevation: 2,
  },
  homeButtonEmoji: {
    fontSize: 12,
    marginRight: 3,
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    elevation: 2,
  },
  logoutButtonEmoji: {
    fontSize: 12,
    marginRight: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C27B0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    elevation: 2,
  },
  adminButtonEmoji: {
    fontSize: 12,
    marginRight: 3,
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
};

export default function AppNavigator() {
  const { user } = useUserStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'super';
  
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
                style={navStyles.homeButton}
              >
                <Text style={navStyles.homeButtonEmoji}>🏠</Text>
                <Text style={navStyles.homeButtonText}>Home</Text>
              </TouchableOpacity>
              {isAdmin && (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Admin')}
                  style={navStyles.adminButton}
                >
                  <Text style={navStyles.adminButtonEmoji}>⚙️</Text>
                  <Text style={navStyles.adminButtonText}>Admin</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={async () => {
                  try {
                    await signOut(auth);
                    navigation.navigate('Login');
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}
                style={navStyles.logoutButton}
              >
                <Text style={navStyles.logoutButtonEmoji}>⏻</Text>
                <Text style={navStyles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : undefined,
        })}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
