import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import demoData from './DemoData';
import API_BASE_URL from '../config/env';
import userStore from './UserStore';
import { getAuthToken } from '../services/firebaseAuth';

const useQuestionStore = create(
  persist(
    (set, get) => ({
      quizData: { id: null, name: '', category: '', duration: 0, uploadedTime: '', questions: [] },
      userAnswer: [],
      error: null,
      remainingTime: 0,
      trueAnswer: 0,
      falseAnswer: 0,
      auth: {},
      page: 1,
      isLoading: false,
      isCompleted: false,
      completedQuizzes: [],

      fetchQuizData: async (query, email) => {
        set({ isLoading: true });
        const user = userStore.getState().user;
        const token = await getAuthToken();

        if (!user || user.payment_status !== 'PAID') {
          set({
            quizData: demoData,
            remainingTime: demoData.duration * 60,
            page: 1,
            userAnswer: [],
            isLoading: false,
          });
          return;
        }

        try {
          const res = await fetch(`${API_BASE_URL}/quiz/get-by-name?quizName=${encodeURIComponent(query)}&email=${encodeURIComponent(user.email)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          set({
            quizData: data.quiz,
            remainingTime: data.quiz.duration * 60,
            page: 1,
            userAnswer: [],
            isLoading: false,
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      addAnswer: ({ question, answer }) =>
        set((state) => ({
          userAnswer: [...state.userAnswer, { question, answer }],
        })),

      checkAnswer: () =>
        set((state) => {
          const correct = state.userAnswer.filter((item) => {
            const q = state.quizData.questions.find((q) => q.question === item.question);
            return q && q.correctAnswer === item.answer;
          }).length;
          return { trueAnswer: correct, falseAnswer: state.userAnswer.length - correct };
        }),

      updateRemainingTime: (time) =>
        set((state) => ({
          remainingTime: time,
        })),

      nextPage: () =>
        set((state) => ({
          page: state.page + 1,
        })),

      prevPage: () =>
        set((state) => ({
          page: state.page - 1,
        })),

      resetForNewAttempt: () =>
        set((state) => ({
          userAnswer: [],
          remainingTime: state.quizData.duration * 60,
          trueAnswer: 0,
          falseAnswer: 0,
          error: null,
          page: 1,
          isLoading: false,
        })),

      resetQuestion: () =>
        set({
          quizData: { id: null, name: '', category: '', duration: 0, uploadedTime: '', questions: [] },
          userAnswer: [],
          remainingTime: 0,
          trueAnswer: 0,
          falseAnswer: 0,
          error: null,
          page: 1,
          isLoading: false,
        }),

      setAuth: (auth) =>
        set(() => ({
          auth,
        })),

      clearAuth: () =>
        set(() => ({
          auth: {},
        })),

      logoutUser: () => {
        set({
          quizData: { id: null, name: '', category: '', duration: 0, uploadedTime: '', questions: [] },
          userAnswer: [],
          error: null,
          remainingTime: 0,
          trueAnswer: 0,
          falseAnswer: 0,
          auth: {},
          page: 1,
        });
        AsyncStorage.removeItem('question-storage');
      },

      isLastQuestion: () => {
        const state = get();
        return state.page === state.quizData.questions.length;
      },

      isFirstQuestion: () => {
        const state = get();
        return state.page === 1;
      },

      hasActiveQuiz: () => {
        const state = get();
        return state.quizData.questions.length > 0 && state.remainingTime > 0 && !state.isCompleted;
      },

      markCompleted: () =>
        set(() => ({
          isCompleted: true,
        })),

      getQuizProgress: () => {
        const state = get();
        return {
          quizName: state.quizData.name,
          currentPage: state.page,
          totalQuestions: state.quizData.questions.length,
          answeredQuestions: state.userAnswer.length,
          remainingTime: state.remainingTime,
        };
      },

      addCompletedQuiz: (quizName) =>
        set((state) => {
          if (!state.completedQuizzes.includes(quizName)) {
            return {
              completedQuizzes: [...state.completedQuizzes, quizName],
            };
          }
          return {};
        }),

      isQuizCompleted: (quizName) => {
        const state = get();
        return state.completedQuizzes.includes(quizName);
      },

      getCompletedQuizzes: () => {
        const state = get();
        return state.completedQuizzes;
      },
    }),
    {
      name: 'question-storage',
      getStorage: () => AsyncStorage,
      partialize: (state) => ({
        auth: state.auth,
        quizData: state.quizData,
        userAnswer: state.userAnswer,
        remainingTime: state.remainingTime,
        page: state.page,
        trueAnswer: state.trueAnswer,
        falseAnswer: state.falseAnswer,
        isCompleted: state.isCompleted,
        completedQuizzes: state.completedQuizzes,
      }),
    }
  )
);

export default useQuestionStore;
