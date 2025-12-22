import React, { useState, useCallback, memo, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ReviewScreen from './screens/ReviewScreen';
import SubjectResultsScreen from './screens/SubjectResultsScreen';
import HomeScreen from './screens/HomeScreen';
import QuizScreen from './screens/QuizScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ScreenWrapper from './components/ScreenWrapper';
import { navigationRef } from './services/navigationService';

import useUserStore from './store/UserStore';
import useQuizStore from './store/QuizStore';

const Stack = createStackNavigator();

const HamburgerButton = memo(({ onPress }) => {
  console.log('HamburgerButton rendered with onPress:', !!onPress);
  return (
    <TouchableOpacity onPress={() => {
      console.log('Hamburger button pressed, onPress exists:', !!onPress);
      if (onPress) {
        console.log('Calling onPress function');
        onPress();
      } else {
        console.log('No onPress function available');
      }
    }} style={styles.hamburgerButton}>
      <Text style={styles.hamburgerIcon}>☰</Text>
    </TouchableOpacity>
  );
});

export const MenuContext = createContext();

const MenuProvider = ({ children }) => {
  const [toggleMenuFn, setToggleMenuFn] = useState(() => () => {});
  return (
    <MenuContext.Provider value={{ toggleMenuFn, setToggleMenuFn }}>
      {children}
    </MenuContext.Provider>
  );
};

const WrappedScreen = ({ component: Component, ...props }) => (
  <ScreenWrapper key="stable-wrapper" {...props}>
    <Component {...props} />
  </ScreenWrapper>
);

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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginTop: 60,
    marginLeft: 16,
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 140,
    elevation: 4,
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

const headerStyle = {
  backgroundColor: '#1e40af',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
};

const headerTitleStyle = {
  fontSize: 18,
  fontWeight: '600',
  color: '#ffffff',
  letterSpacing: 0.3,
};

const getHeaderTitle = (routeName, route) => {
  switch (routeName) {
    case 'Login': return '🌐 Exam Sphere';
    case 'Signup': return '🌐 Sign Up';
    case 'ForgotPassword': return '🔒 Reset Password';
    case 'Review': return '';
    case 'Profile': return '👤 Profile';
    case 'Quiz': {
      const timeRemaining = route?.params?.timeRemaining || 0;
      return `⏰ ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`;
    }
    default: return '🌐 Exam Sphere';
  }
};

export default function AppNavigator() {
  const { hasActiveQuiz } = useQuizStore();

  const screenOptions = useCallback(({ navigation, route }) => ({
    headerLeft: () => null,
    gestureEnabled: false,
    headerStyle,
    headerTitleStyle,
    headerTitle: '',
    headerLeft: route.name !== 'Login' && route.name !== 'Signup' && route.name !== 'ForgotPassword' ? () => {
      const { toggleMenuFn } = useContext(MenuContext) || {};
      
      if (route.name === 'Profile') {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HamburgerButton onPress={toggleMenuFn} />
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                marginLeft: 8,
              }}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>← Home</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      if (route.name === 'Progress') {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HamburgerButton onPress={toggleMenuFn} />
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                marginLeft: 8,
              }}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>← Home</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      if (route.name === 'SubjectResults') {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HamburgerButton onPress={toggleMenuFn} />
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                marginLeft: 8,
              }}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>← Progress</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      if (route.name === 'Quiz') {
        const subjectName = route.params?.subjectName || 'Subject';
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HamburgerButton onPress={toggleMenuFn} />
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                marginLeft: 8,
              }}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>← {subjectName}</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      if (route.name === 'Review') {
        const subjectName = route.params?.subjectName || 'Subject';
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HamburgerButton onPress={toggleMenuFn} />
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                marginLeft: 8,
              }}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>← {subjectName}</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      if (route.name === 'Leaderboard') {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HamburgerButton onPress={toggleMenuFn} />
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                marginLeft: 8,
              }}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>← Home</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      return <HamburgerButton onPress={toggleMenuFn} />;
    } : () => null,
    headerRight: () => {
      if (route.name === 'Quiz' && !route.params?.showingResults) {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...headerTitleStyle, marginRight: 12 }}>{getHeaderTitle(route.name, route)}</Text>
            <TouchableOpacity 
              style={{
                backgroundColor: '#ffffff20',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                marginRight: 16,
              }}
              onPress={() => {
                route.params?.openQuestions?.();
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>📋 Questions</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <Text style={{ ...headerTitleStyle, marginRight: 16 }}>{getHeaderTitle(route.name, route)}</Text>
      );
    },
    gestureEnabled: route.name === 'Review',
  }), [hasActiveQuiz]);

  return (
    <MenuProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={screenOptions}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Review">{(props) => <WrappedScreen {...props} component={ReviewScreen} />}</Stack.Screen>
          <Stack.Screen name="SubjectResults">{(props) => <WrappedScreen {...props} component={SubjectResultsScreen} />}</Stack.Screen>
          <Stack.Screen name="Home">{(props) => <WrappedScreen {...props} component={HomeScreen} />}</Stack.Screen>
          <Stack.Screen name="Quiz">{(props) => <WrappedScreen {...props} component={QuizScreen} />}</Stack.Screen>
          <Stack.Screen name="Progress">{(props) => <WrappedScreen {...props} component={ProgressScreen} />}</Stack.Screen>
          <Stack.Screen name="Profile">{(props) => <WrappedScreen {...props} component={ProfileScreen} />}</Stack.Screen>
          <Stack.Screen name="Leaderboard">{(props) => <WrappedScreen {...props} component={LeaderboardScreen} />}</Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </MenuProvider>
  );
}
