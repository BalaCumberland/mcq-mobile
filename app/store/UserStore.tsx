import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/env';
import { getAuthToken } from '../services/firebaseAuth';


const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      setUser: (userData) => set({ user: userData }),

      fetchUserByEmail: async (email) => {
        try {
          set({ loading: true, error: null });
          console.log("Fetching user details for email:", email);
          console.log("API URL:", `${API_BASE_URL}/students/get-by-email`);
           const url = `${API_BASE_URL}/students/get-by-email?email=${encodeURIComponent(email)}`;

            const token = await getAuthToken();
            console.log("url", url.toString())

            const response = await fetch(url.toString(), { method: "GET", headers: {
              "Authorization": `Bearer ${token}`
            }});

            if (!response.ok) {
              throw new Error('Failed to fetch user details');
            }

          console.log("Response status:", response.status);


          const userData = await response.json();
          console.log("✅ Parsed user data:", userData);
          set({ user: userData, loading: false });
          console.log("📦 Saving user data to AsyncStorage:", userData);
          return userData;
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ user: null });
        await AsyncStorage.removeItem('user-storage'); // ✅ Remove persisted user data
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserStore;
