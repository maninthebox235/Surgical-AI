import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          // Navigate to login screen - will be handled by auth context
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: { email: string; password: string; name: string; role: string }) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  // Video endpoints
  async getVideos(params?: { page?: number; limit?: number; search?: string }) {
    const response = await this.api.get('/videos', { params });
    return response.data;
  }

  async getVideo(id: string) {
    const response = await this.api.get(`/videos/${id}`);
    return response.data;
  }

  async uploadVideo(formData: FormData) {
    const response = await this.api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for video upload
    });
    return response.data;
  }

  async deleteVideo(id: string) {
    const response = await this.api.delete(`/videos/${id}`);
    return response.data;
  }

  // Analysis endpoints
  async getAnalysis(videoId: string) {
    const response = await this.api.get(`/analysis/${videoId}`);
    return response.data;
  }

  async triggerAnalysis(videoId: string) {
    const response = await this.api.post(`/analysis/${videoId}/analyze`);
    return response.data;
  }

  // Annotation endpoints
  async getAnnotations(videoId: string) {
    const response = await this.api.get(`/annotations/video/${videoId}`);
    return response.data;
  }

  async createAnnotation(data: {
    videoId: string;
    timestamp: number;
    type: string;
    content: string;
    drawingData?: any;
  }) {
    const response = await this.api.post('/annotations', data);
    return response.data;
  }

  async updateAnnotation(id: string, data: any) {
    const response = await this.api.put(`/annotations/${id}`, data);
    return response.data;
  }

  async deleteAnnotation(id: string) {
    const response = await this.api.delete(`/annotations/${id}`);
    return response.data;
  }

  // Comment endpoints
  async getComments(annotationId: string) {
    const response = await this.api.get(`/annotations/${annotationId}/comments`);
    return response.data;
  }

  async createComment(annotationId: string, content: string) {
    const response = await this.api.post(`/annotations/${annotationId}/comments`, { content });
    return response.data;
  }

  // Export endpoint
  async exportAnalysis(videoId: string) {
    const response = await this.api.get(`/analysis/${videoId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new ApiService();