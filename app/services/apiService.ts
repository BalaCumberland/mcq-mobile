import { getAuthToken } from './firebaseAuth';

const API_ENDPOINTS = {
  REGISTER: '/students/register',
  QUIZ_UNATTEMPTED: '/quiz/unattempted-quizzes',
  QUIZ_GET: '/quiz/get-by-name',
};

class ApiService {
  private baseUrl: string;

  constructor() {
    // Use environment variable or fetch from secure config
    this.baseUrl = process.env.REACT_APP_API_URL || 'https://apdjq7fpontm374bg3p2w3gx3m0hcbwy.lambda-url.us-east-1.on.aws';
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

  async getUnattemptedQuizzes(category: string, email: string) {
    const params = new URLSearchParams({ category, email });
    return this.makeRequest(`${API_ENDPOINTS.QUIZ_UNATTEMPTED}?${params}`);
  }

  async getQuizByName(quizName: string, email: string) {
    const params = new URLSearchParams({ quizName, email });
    return this.makeRequest(`${API_ENDPOINTS.QUIZ_GET}?${params}`);
  }
}

export default new ApiService();