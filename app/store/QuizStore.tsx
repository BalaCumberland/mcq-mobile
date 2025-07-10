import { create } from 'zustand';

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
  setQuiz: (quiz: Quiz) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  selectAnswer: (answer: string) => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
}

const useQuizStore = create<QuizState>((set, get) => ({
  quiz: null,
  currentQuestionIndex: 0,
  userAnswers: [],
  showResults: false,
  
  setQuiz: (quiz) => set({ 
    quiz, 
    currentQuestionIndex: 0, 
    userAnswers: new Array(quiz.questions.length).fill(''),
    showResults: false 
  }),
  
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
  
  finishQuiz: () => set({ showResults: true }),
  
  resetQuiz: () => set({ 
    quiz: null, 
    currentQuestionIndex: 0, 
    userAnswers: [], 
    showResults: false 
  })
}));

export default useQuizStore;