/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Add error handling for app registration
try {
  AppRegistry.registerComponent(appName, () => App);
} catch (error) {
  console.error('App registration error:', error);
  // Fallback registration
  AppRegistry.registerComponent(appName, () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return () => React.createElement(View, { style: { flex: 1, justifyContent: 'center', alignItems: 'center' } }, 
      React.createElement(Text, null, 'App initialization failed. Please restart.'));
  });
}
