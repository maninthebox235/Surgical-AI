export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  institutionId?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  uploaderId: string;
  uploadedAt: string;
  procedureType: string;
  patientAge?: number;
  complications?: string[];
  tags?: string[];
  analysisId?: string;
  status: 'uploaded' | 'processing' | 'analyzed' | 'failed';
}

export interface Analysis {
  id: string;
  videoId: string;
  techniques: Technique[];
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  createdAt: string;
  processingTime: number;
}

export interface Technique {
  name: string;
  timestamp: number;
  duration: number;
  confidence: number;
  feedback?: string;
  correct: boolean;
}

export interface Annotation {
  id: string;
  videoId: string;
  userId: string;
  timestamp: number;
  type: 'text' | 'drawing' | 'voice';
  content: string;
  drawingData?: DrawingData;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DrawingData {
  paths: Path[];
  color: string;
  strokeWidth: number;
}

export interface Path {
  points: Point[];
}

export interface Point {
  x: number;
  y: number;
}

export interface Comment {
  id: string;
  annotationId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}