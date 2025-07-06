import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Video API functions
export const createVideo = async (title: string, description: string) => {
  const response = await api.post('/videos', { title, description });
  return response.data;
};

export const uploadVideoFile = async (uploadUrl: string, file: File, onProgress?: (progress: number) => void) => {
  return await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

export const processVideo = async (videoId: number) => {
  const response = await api.post(`/videos/${videoId}/process`);
  return response.data;
};

export const getVideos = async () => {
  const response = await api.get('/videos');
  return response.data;
};

export const getVideo = async (videoId: string) => {
  const response = await api.get(`/videos/${videoId}`);
  return response.data;
};

export const deleteVideo = async (videoId: number) => {
  const response = await api.delete(`/videos/${videoId}`);
  return response.data;
};

// Analysis API functions
export const startAnalysis = async (videoId: string) => {
  const response = await api.post(`/analysis/${videoId}/start`);
  return response.data;
};

export const getVideoAnalysis = async (videoId: string) => {
  const response = await api.get(`/analysis/${videoId}`);
  return response.data;
};

export const getAnalysisResults = async (analysisId: string) => {
  const response = await api.get(`/analysis/${analysisId}/results`);
  return response.data;
};

// Authentication API functions
export const login = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await api.post('/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const register = async (email: string, password: string, fullName: string, role: string = 'student') => {
  const response = await api.post('/register', { 
    email, 
    password, 
    full_name: fullName,
    role 
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

// Annotations API functions
export const createAnnotation = async (annotationData: any) => {
  const response = await api.post('/annotations', annotationData);
  return response.data;
};

export const getAnnotations = async (videoId?: number, annotationType?: string) => {
  const params = new URLSearchParams();
  if (videoId) params.append('video_id', videoId.toString());
  if (annotationType) params.append('annotation_type', annotationType);
  
  const response = await api.get(`/annotations?${params.toString()}`);
  return response.data;
};

export const updateAnnotation = async (annotationId: number, annotationData: any) => {
  const response = await api.put(`/annotations/${annotationId}`, annotationData);
  return response.data;
};

export const deleteAnnotation = async (annotationId: number) => {
  const response = await api.delete(`/annotations/${annotationId}`);
  return response.data;
};

export const bulkCreateAnnotations = async (videoId: number, annotations: any[]) => {
  const response = await api.post('/annotations/bulk', { video_id: videoId, annotations });
  return response.data;
};

// Profile API functions
export const updateProfile = async (profileData: any) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

// Export functionality
export const exportVideoReport = async (videoId: string, format: string = 'pdf') => {
  const response = await api.get(`/videos/${videoId}/export?format=${format}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const shareVideo = async (videoId: number, shareData: any) => {
  const response = await api.post(`/videos/${videoId}/share`, shareData);
  return response.data;
};

export default api; 