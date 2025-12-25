import { getAuthToken } from './firebaseAuth';
import { LAMBDA_MCQ_GO_API_URL } from '../config/env';
import { QuizSubmitRequest, QuizSubmitResponse } from '../types/quiz';
import useUserStore from '../store/UserStore';
import { auth } from '../config/firebase';
import { reset } from './navigationService';

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
    try {
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
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Handle authentication errors
        if (response.status === 401 || errorMessage.includes('not authenticated')) {
          const { logout } = useUserStore.getState();
          await logout();
          await auth.signOut();
          reset('Login');
          throw new Error('User is not authenticated');
        }
        
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error: any) {
      // Handle authentication errors in catch block as well
      if (error.message === 'User is not authenticated' || error.message.includes('not authenticated')) {
        const { logout } = useUserStore.getState();
        await logout();
        await auth.signOut();
        reset('Login');
      }
      throw error;
    }
  }

  async registerStudent(data: any) {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const responseText = await response.text();
        console.log('Raw API Error Response:', responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          console.log('Parsed API Error Response:', errorData);
          
          // Extract nested message from the error structure
          if (errorData.error && typeof errorData.error === 'string') {
            // Extract message from nested JSON structure
            const messageMatch = errorData.error.match(/"message":\s*"([^"]+)"/);  
            console.log('Message match result:', messageMatch);
            if (messageMatch && messageMatch[1]) {
              console.log('Extracted message:', messageMatch[1]);
              errorMessage = messageMatch[1];
            } else {
              console.log('No message match found, using full error');
              errorMessage = errorData.error;
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.log('JSON parse failed, trying to extract message from raw text');
          // Extract message directly from the raw response text
          const messageMatch = responseText.match(/"message":\s*"([^"]+)"/);  
          if (messageMatch && messageMatch[1]) {
            errorMessage = messageMatch[1];
          } else {
            errorMessage = responseText || errorMessage;
          }
        }
      } catch (e) {
        console.log('Failed to read error response:', e);
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
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
    answers: { questionId: string; selectedAnswer: string }[],
    quiz: any
  ): Promise<QuizSubmitResponse> {
    try {
      const params = new URLSearchParams({ 
        quizName: decodeURIComponent(quizName),
        className, 
        subjectName, 
        topic 
      });
      
      // Convert to old format that server expects with option letters
      const oldFormatAnswers = answers.map((answer, index) => {
        if (!answer.selectedAnswer) {
          return { qno: index + 1, options: [] };
        }
        
        // Get the question to find all answers
        const question = quiz.questions[index];
        const allAnswers = question.allAnswers || [];
        const answerIndex = allAnswers.indexOf(answer.selectedAnswer);
        
        if (answerIndex !== -1) {
          // Convert index to option letter (0->A, 1->B, 2->C, 3->D)
          const optionLetter = String.fromCharCode(65 + answerIndex);
          return { qno: index + 1, options: [optionLetter] };
        }
        
        return { qno: index + 1, options: [] };
      });
      
      const requestBody = {
        answers: oldFormatAnswers
      };
      
      // Try existing endpoint structure first
      const specUrl = 'https://ieetpwfoci.execute-api.us-east-1.amazonaws.com/prod/v2/quiz/submit';
      const fullUrl = `${specUrl}?${params}`;
      
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
        if (response.status === 401) {
          const { logout } = useUserStore.getState();
          await logout();
          await auth.signOut();
          reset('Login');
          throw new Error('User is not authenticated');
        }
        throw new Error(`API Error: ${response.status}`);
      }
      
      return response.json();
    } catch (error: any) {
      if (error.message === 'User is not authenticated' || error.message.includes('not authenticated')) {
        const { logout } = useUserStore.getState();
        await logout();
        await auth.signOut();
        reset('Login');
      }
      throw error;
    }
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
    try {
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
        if (response.status === 401) {
          const { logout } = useUserStore.getState();
          await logout();
          await auth.signOut();
          reset('Login');
          throw new Error('User is not authenticated');
        }
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API Error: ${response.status}`);
      }
      
      return response.json();
    } catch (error: any) {
      if (error.message === 'User is not authenticated' || error.message.includes('not authenticated')) {
        const { logout } = useUserStore.getState();
        await logout();
        await auth.signOut();
        reset('Login');
      }
      throw error;
    }
  }

  async getProgress() {
    return this.makeRequest('/students/progress');
  }

  async getCurriculum(className: string) {
    const specUrl = 'https://ieetpwfoci.execute-api.us-east-1.amazonaws.com/prod/v2/class/curriculum';
    const params = new URLSearchParams({ className });
    const token = await getAuthToken();
    
    const response = await fetch(`${specUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        const { logout } = useUserStore.getState();
        await logout();
        await auth.signOut();
        reset('Login');
        throw new Error('User is not authenticated');
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
}

export default new ApiService();