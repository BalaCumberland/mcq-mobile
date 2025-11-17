import { getAuthToken } from './firebaseAuth';
import { LAMBDA_MCQ_GO_API_URL } from '../config/env';

const API_ENDPOINTS = {
  REGISTER: '/students/register',
  QUIZ_LIST: '/quiz/list',
  QUIZ_GET: '/quiz',
  QUIZ_SUBMIT: '/quiz/submit',
  USER_BY_EMAIL: '/students/lookup',
  SUBJECTS: '/subject/fetch',
  TOPICS: '/topic/fetch',
};

class ApiService {
  public baseUrl: string;

  constructor() {
    this.baseUrl = LAMBDA_MCQ_GO_API_URL;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  async registerStudent(data: any) {
    return this.makeRequest(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(data),
    });
  }

  async getQuizzes(className: string, subjectName: string, topic: string) {
    const params = new URLSearchParams({ className, subjectName, topic });
    return this.makeRequest(`${API_ENDPOINTS.QUIZ_LIST}?${params}`);
  }

  async getQuiz(className: string, subjectName: string, topic: string, quizName: string) {
    const params = new URLSearchParams({ className, subjectName, topic, quizName });
    return this.makeRequest(`${API_ENDPOINTS.QUIZ_GET}?${params}`);
  }

  async submitQuiz(className: string, subjectName: string, topic: string, quizName: string, answers: any[]) {
    const params = new URLSearchParams({ 
      quizName: decodeURIComponent(quizName),
      className, 
      subjectName, 
      topic 
    });
    return this.makeRequest(`${API_ENDPOINTS.QUIZ_SUBMIT}?${params}`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async getUserByEmail(email: string) {
    const params = new URLSearchParams({ identifier: email });
    return this.makeRequest(`${API_ENDPOINTS.USER_BY_EMAIL}?${params}`);
  }

  async getSubjects(className: string) {
    const params = new URLSearchParams({ className });
    return this.makeRequest(`${API_ENDPOINTS.SUBJECTS}?${params}`);
  }

  async getTopics(className: string, subjectName: string) {
    const params = new URLSearchParams({ className, subjectName });
    return this.makeRequest(`${API_ENDPOINTS.TOPICS}?${params}`);
  }
}

export default new ApiService();