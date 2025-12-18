import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCU8MW1DSWgqT4X_mOKuRm76gJMhJgWTOU",
  authDomain: "gothinkerstech.firebaseapp.com",
  projectId: "gothinkerstech",
  storageBucket: "gothinkerstech.firebasestorage.app",
  messagingSenderId: "1098307157317",
  appId: "1:1098307157317:web:1be342bfe515dcd704d22c",
  measurementId: "G-SQBENZ1XCP"
};

// ✅ Initialize app only once (avoids "No default app" error)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth };
