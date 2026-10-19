export interface Annotation {
  id: string;
  timestamp: number;
  text?: string;
  content?: string;
  description?: string;
  type: 'note' | 'highlight' | 'warning';
  userId?: string;
  videoId?: string;
  tags?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
