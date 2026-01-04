import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCU9E4AArx2SAg1S7Rz8-v_5IID21LbykU",
  authDomain: "examsphereguru.firebaseapp.com",
  projectId: "examsphereguru",
  storageBucket: "examsphereguru.firebasestorage.app",
  messagingSenderId: "332017099056",
  appId: "1:332017099056:web:e25ff7589a0e748bd768f5",
  measurementId: "G-SY0HPB0BLG"
};

// ✅ Initialize app only once (avoids "No default app" error)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
