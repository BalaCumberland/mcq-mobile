import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Question {
  explanation: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string;
}

interface Quiz {
  quizName: string;
  duration: number;
  category: string;
  questions: Question[];
}

interface QuizState {
  quiz: Quiz | null;
  currentQuestionIndex: number;
  userAnswers: string[];
  showResults: boolean;
  startTime: number | null;
  timeRemaining: number | null;
  setQuiz: (quiz: Quiz) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  selectAnswer: (answer: string) => void;
  setPage: (index: number) => void;
  skipQuestion: () => void;
  finishQuiz: () => void;
  submitQuiz: (className: string, subjectName: string, topic: string) => Promise<void>;
  resetQuiz: () => void;
  updateTimer: () => void;
  hasActiveQuiz: () => boolean;
}

const useQuizStore = create<QuizState>()(persist((set, get) => ({
  quiz: null,
  currentQuestionIndex: 0,
  userAnswers: [],
  showResults: false,
  startTime: null,
  timeRemaining: null,
  
  setQuiz: (quiz) => {
    const now = Date.now();
    set({ 
      quiz, 
      currentQuestionIndex: 0, 
      userAnswers: new Array(quiz.questions.length).fill(''),
      showResults: false,
      startTime: now,
      timeRemaining: quiz.duration * 60
    });
  },
  
  nextQuestion: () => set((state) => ({
    currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, (state.quiz?.questions.length || 1) - 1)
  })),
  
  prevQuestion: () => set((state) => ({
    currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
  })),
  
  selectAnswer: (answer) => set((state) => {
    const newAnswers = [...state.userAnswers];
    newAnswers[state.currentQuestionIndex] = answer;
    return { userAnswers: newAnswers };
  }),
  
  setPage: (index) => set({ currentQuestionIndex: index }),

  skipQuestion: () => set((state) => {
    const newAnswers = [...state.userAnswers];
    newAnswers[state.currentQuestionIndex] = null;
    
    if (state.currentQuestionIndex < (state.quiz?.questions.length || 0) - 1) {
      return { 
        userAnswers: newAnswers,
        currentQuestionIndex: state.currentQuestionIndex + 1 
      };
    } else {
      return { 
        userAnswers: newAnswers,
        showResults: true 
      };
    }
  }),
  
  finishQuiz: () => set({ showResults: true }),
  
  submitQuiz: async (className: string, subjectName: string, topic: string) => {
    const state = get();
    if (!state.quiz) return;
    
    try {
      const ApiService = await import('../services/apiService');
      await ApiService.default.submitQuiz(
        className,
        subjectName, 
        topic,
        state.quiz.quizName,
        state.userAnswers
      );
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  },
  
  resetQuiz: () => set({ 
    quiz: null, 
    currentQuestionIndex: 0, 
    userAnswers: [], 
    showResults: false,
    startTime: null,
    timeRemaining: null
  }),
  
  updateTimer: () => {
    const state = get();
    if (!state.startTime || !state.quiz || state.showResults) return;
    
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const remaining = (state.quiz.duration * 60) - elapsed;
    
    if (remaining <= 0) {
      set({ showResults: true, timeRemaining: 0 });
    } else if (Math.abs(remaining - (state.timeRemaining || 0)) > 0) {
      set({ timeRemaining: remaining });
    }
  },
  
  hasActiveQuiz: () => {
    const state = get();
    return !!(state.quiz && !state.showResults && state.timeRemaining && state.timeRemaining > 0);
  }
}), {
  name: 'quiz-storage',
  storage: createJSONStorage(() => AsyncStorage),
}));

export default useQuizStore;