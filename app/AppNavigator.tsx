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

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={({ navigation, route }) => ({
          headerLeft: () => null,
          gestureEnabled: false,
          headerRight: route.name !== 'Login' && route.name !== 'Signup' ? () => (
            <View style={{ flexDirection: 'row', gap: 10, marginRight: 15 }}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Home')}
                style={{ backgroundColor: '#007bff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Home</Text>
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
                style={{ backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : undefined,
        })}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
