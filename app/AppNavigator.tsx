import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native';
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
            <TouchableOpacity 
              onPress={() => navigation.navigate('Home')}
              style={{ marginRight: 15, backgroundColor: '#007bff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Home</Text>
            </TouchableOpacity>
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
