export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
}

export interface QuizSubmitRequest {
  studentId: string;
  answers: QuizAnswer[];
}

export interface QuizResult {
  qno: number;
  question: string;
  status: 'correct' | 'wrong' | 'skipped';
  studentAnswer: string[];
  correctAnswer: string[];
  explanation: string;
}

export interface QuizSubmitResponse {
  correctCount: number;
  percentage: number;
  skippedCount: number;
  totalCount: number;
  wrongCount: number;
  results: QuizResult[];
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  score: number;
  rank: number;
}

export interface LeaderboardResponse {
  class: string;
  leaderboard: LeaderboardEntry[];
}