import { auth } from "../config/firebase";
import {
onAuthStateChanged,
sendEmailVerification,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
} from "firebase/auth";
import API_BASE_URL from "../config/env";
import useUserStore from "../store/UserStore";
import { reset } from "./navigationService";

export async function handleRegister(email, password, name, phoneNumber, studentClass) {
  return new Promise(async (resolve, reject) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      try {
        await sendEmailVerification(user);
      } catch (emailError) {
      }

      const response = await fetch(`${API_BASE_URL}/students/register`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
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
      }

      await useUserStore.getState().fetchUserByEmail(email);
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
        try {
          const token = await user.getIdToken();
          resolve(token);
        } catch (error) {
          const { logout } = useUserStore.getState();
          await logout();
          await auth.signOut();
          reset('Login');
          reject(new Error("User is not authenticated"));
        }
      } else {
        const { logout } = useUserStore.getState();
        await logout();
        reset('Login');
        reject(new Error("User is not authenticated"));
      }
    });
  });
};

export const resendVerifiedEmail = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User is not authenticated");
  }
  await sendEmailVerification(user);
};
