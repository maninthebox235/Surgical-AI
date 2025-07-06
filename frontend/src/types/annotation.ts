export interface Annotation {
  id: string;
  timestamp: number;
  text?: string;
  content?: string;
  type: 'note' | 'highlight' | 'warning';
  userId?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
} 