export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
export const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN || '';
export const AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || '';
export const AUTH0_AUDIENCE = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE || '';

export const VIDEO_UPLOAD_SIZE_LIMIT = 500 * 1024 * 1024; // 500MB
export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'mov', 'avi'];

export const COLORS = {
  primary: '#2196F3',
  secondary: '#FFC107',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  surface: '#FFFFFF',
  background: '#FAFAFA',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
};

export const ANNOTATION_COLORS = [
  '#FF5252',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFC107',
  '#FF9800',
  '#FF5722',
];