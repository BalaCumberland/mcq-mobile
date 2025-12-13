import { getAuthToken } from './firebaseAuth';
import { LAMBDA_MCQ_GO_API_URL } from '../config/env';
import { QuizSubmitRequest, QuizSubmitResponse } from '../types/quiz';

const API_ENDPOINTS = {
  REGISTER: '/students/register',
  QUIZ_LIST: '/quiz/list',
  QUIZ_UNATTEMPTED: '/quiz/unattempted-quizzes',
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
    return this.makeRequest(`${API_ENDPOINTS.QUIZ_UNATTEMPTED}?${params}`);
  }

  async getQuiz(className: string, subjectName: string, topic: string, quizName: string) {
    const params = new URLSearchParams({ className, subjectName, topic, quizName });
    return this.makeRequest(`${API_ENDPOINTS.QUIZ_GET}?${params}`);
  }

  async submitQuiz(
    className: string, 
    subjectName: string, 
    topic: string, 
    quizName: string, 
    studentId: string,
    answers: { questionId: string; selectedAnswer: string }[]
  ): Promise<QuizSubmitResponse> {
    const params = new URLSearchParams({ 
      quizName: decodeURIComponent(quizName),
      className, 
      subjectName, 
      topic 
    });
    
    // Convert to old format that server expects
    const oldFormatAnswers = answers.map((answer, index) => ({
      qno: index + 1,
      options: answer.selectedAnswer ? [answer.selectedAnswer] : []
    }));
    
    const requestBody = {
      answers: oldFormatAnswers
    };
    
    // Try existing endpoint structure first
    const specUrl = 'https://ieetpwfoci.execute-api.us-east-1.amazonaws.com/prod/v2/quiz/submit';
    const fullUrl = `${specUrl}?${params}`;
    console.log('Quiz Submit URL:', fullUrl);
    console.log('Request Body:', JSON.stringify(requestBody));
    
    const token = await getAuthToken();
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
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

  async getClassesPublic() {
    const url = `${this.baseUrl}/class/fetch`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  async upgradeClass(newClass: string) {
    const token = await getAuthToken();
    const url = `${this.baseUrl}/students/upgrade-class`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ newClass }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API Error: ${response.status}`);
    }
    
    return response.json();
  }
}

export default new ApiService();