import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Animated } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import useQuizStore from '../store/QuizStore';
import { MenuContext } from '../AppNavigator';

const ScreenWrapper = ({ children, navigation, showMenu = true }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { hasActiveQuiz } = useQuizStore();
  const menuContext = useContext(MenuContext);
  const slideAnim = useRef(new Animated.Value(-250)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuVisible ? 0 : -250,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isMenuVisible, slideAnim]);

  const toggleMenu = useCallback(() => {
    setIsMenuVisible(!isMenuVisible);
  }, [isMenuVisible]);

  useEffect(() => {
    if (menuContext?.setToggleMenuFn) {
      menuContext.setToggleMenuFn(() => toggleMenu);
    }
  }, [toggleMenu, menuContext]);

  const navigateWithQuizCheck = useCallback((screenName) => {
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
  }, [hasActiveQuiz, navigation]);

  const handleLogout = useCallback(() => {
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
  }, [hasActiveQuiz, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {React.cloneElement(children, { toggleMenu: () => setIsMenuVisible(!isMenuVisible) })}
      </View>
      
      <Animated.View style={[styles.expandableMenu, { transform: [{ translateX: slideAnim }] }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateWithQuizCheck('Home')}>
            <Text style={styles.menuIcon}>🏠</Text>
            <Text style={styles.menuText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateWithQuizCheck('Progress')}>
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={styles.menuText}>Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateWithQuizCheck('Profile')}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <Text style={styles.menuIcon}>📴</Text>
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  expandableMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#1e40af',
    borderRightWidth: 1,
    borderRightColor: '#1d4ed8',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    paddingTop: 20,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1d4ed8',
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#1d4ed8',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
});

export default ScreenWrapper;