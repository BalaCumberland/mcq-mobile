import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CompletedQuizState {
  completedQuizzes: string[];
  addCompletedQuiz: (quizName: string) => void;
  isQuizCompleted: (quizName: string) => boolean;
  clearCompleted: () => void;
}

const useCompletedQuizStore = create<CompletedQuizState>()(
  persist(
    (set, get) => ({
      completedQuizzes: [],
      
      addCompletedQuiz: (quizName) => set((state) => ({
        completedQuizzes: [...state.completedQuizzes, quizName]
      })),
      
      isQuizCompleted: (quizName) => {
        return get().completedQuizzes.includes(quizName);
      },
      
      clearCompleted: () => set({ completedQuizzes: [] })
    }),
    {
      name: 'completed-quizzes',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCompletedQuizStore;