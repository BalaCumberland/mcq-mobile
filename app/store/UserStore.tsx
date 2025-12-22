import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAMBDA_MCQ_GO_API_URL } from '../config/env';
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
          const token = await getAuthToken();
          const url = `${LAMBDA_MCQ_GO_API_URL}/students/profile?email=${encodeURIComponent(email)}`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch user details: ${response.status} - ${errorText}`);
          }

          const userData = await response.json();
          set({ user: userData, loading: false });
          return userData;
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ user: null });
        await AsyncStorage.clear(); // Clear all cached data
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserStore;
