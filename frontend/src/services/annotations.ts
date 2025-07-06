import axios from 'axios';

export interface Annotation {
  id: string;
  video_id: string;
  timestamp: number;
  text: string;
  type: 'note' | 'highlight' | 'warning';
  created_at: string;
  updated_at: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const getAnnotations = async (videoId: string): Promise<Annotation[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/videos/${videoId}/annotations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching annotations:', error);
    throw error;
  }
};

export const createAnnotation = async (
  videoId: string,
  annotation: Omit<Annotation, 'id' | 'video_id' | 'created_at' | 'updated_at'>
): Promise<Annotation> => {
  try {
    const response = await axios.post(`${API_URL}/api/videos/${videoId}/annotations`, annotation);
    return response.data;
  } catch (error) {
    console.error('Error creating annotation:', error);
    throw error;
  }
};

export const updateAnnotation = async (
  videoId: string,
  annotationId: string,
  annotation: Partial<Omit<Annotation, 'id' | 'video_id' | 'created_at' | 'updated_at'>>
): Promise<Annotation> => {
  try {
    const response = await axios.put(
      `${API_URL}/api/videos/${videoId}/annotations/${annotationId}`,
      annotation
    );
    return response.data;
  } catch (error) {
    console.error('Error updating annotation:', error);
    throw error;
  }
};

export const deleteAnnotation = async (
  videoId: string,
  annotationId: string
): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/videos/${videoId}/annotations/${annotationId}`);
  } catch (error) {
    console.error('Error deleting annotation:', error);
    throw error;
  }
};

// Local storage fallback for offline support
const ANNOTATIONS_STORAGE_KEY = 'video_annotations';

export const getLocalAnnotations = (videoId: string): Annotation[] => {
  try {
    const stored = localStorage.getItem(`${ANNOTATIONS_STORAGE_KEY}_${videoId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading local annotations:', error);
    return [];
  }
};

export const saveLocalAnnotation = (
  videoId: string,
  annotation: Annotation
): void => {
  try {
    const annotations = getLocalAnnotations(videoId);
    const updatedAnnotations = [...annotations, annotation];
    localStorage.setItem(
      `${ANNOTATIONS_STORAGE_KEY}_${videoId}`,
      JSON.stringify(updatedAnnotations)
    );
  } catch (error) {
    console.error('Error saving local annotation:', error);
  }
};

export const updateLocalAnnotation = (
  videoId: string,
  annotationId: string,
  updatedAnnotation: Partial<Annotation>
): void => {
  try {
    const annotations = getLocalAnnotations(videoId);
    const updatedAnnotations = annotations.map((a) =>
      a.id === annotationId ? { ...a, ...updatedAnnotation } : a
    );
    localStorage.setItem(
      `${ANNOTATIONS_STORAGE_KEY}_${videoId}`,
      JSON.stringify(updatedAnnotations)
    );
  } catch (error) {
    console.error('Error updating local annotation:', error);
  }
};

export const deleteLocalAnnotation = (
  videoId: string,
  annotationId: string
): void => {
  try {
    const annotations = getLocalAnnotations(videoId);
    const updatedAnnotations = annotations.filter((a) => a.id !== annotationId);
    localStorage.setItem(
      `${ANNOTATIONS_STORAGE_KEY}_${videoId}`,
      JSON.stringify(updatedAnnotations)
    );
  } catch (error) {
    console.error('Error deleting local annotation:', error);
  }
}; 