import { auth } from "../config/firebase";
import {
onAuthStateChanged,
sendEmailVerification,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
} from "firebase/auth";
import API_BASE_URL from "../config/env";
import useUserStore from "../store/UserStore";

export async function handleRegister(email, password, name, phoneNumber, studentClass) {
  return new Promise(async (resolve, reject) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const response = await fetch(`${API_BASE_URL}/students/register`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: name,
          phoneNumber: phoneNumber,
          studentClass: studentClass,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to save student details: ${errorMessage}`);
      }

      resolve(userCredential.user);
    } catch (error) {
      reject({ message: error.message });
    }
  });
}

export async function handleLogin(email, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        // Replace alert for React Native
        console.warn("⚠️ Email not verified.");
      }

      await useUserStore.getState().fetchUserByEmail(email);
      console.log("✅ User logged in successfully");
      resolve(userCredential.user);
    } catch (error) {
      reject({ message: error.message });
    }
  });
}

export const getAuthToken = async () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();

      if (user) {
        const token = await user.getIdToken();
        resolve(token);
      } else {
        reject(new Error("User is not authenticated"));
      }
    });
  });
};

export const resendVerifiedEmail = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        resolve();
      } else {
        reject(new Error("User is not authenticated"));
      }
    } catch (error) {
      reject(error);
    }
  });
};
