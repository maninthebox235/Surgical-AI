import { Annotation } from './annotations';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  name: string;
  role: 'surgeon' | 'assistant' | 'observer';
}

interface CollaborationSession {
  id: string;
  videoId: string;
  participants: User[];
  annotations: Annotation[];
  currentTime: number;
  isPlaying: boolean;
}

interface CollaborationMessage {
  type: 'annotation' | 'playback' | 'chat';
  data: unknown;
  sender: User;
  timestamp: number;
}

export class CollaborationService {
  private socket: Socket | null = null;
  private session: CollaborationSession | null = null;
  private messageHandlers: ((message: CollaborationMessage) => void)[] = [];

  constructor(private serverUrl: string) {}

  connect(sessionId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          query: { sessionId, userId },
        });

        this.socket.on('connect', () => {
          console.log('Connected to collaboration server');
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from collaboration server');
        });

        this.socket.on('error', (error: Error) => {
          console.error('Collaboration error:', error);
          reject(error);
        });

        this.socket.on('message', (message: CollaborationMessage) => {
          this.messageHandlers.forEach((handler) => handler(message));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onMessage(handler: (message: CollaborationMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  offMessage(handler: (message: CollaborationMessage) => void): void {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  sendMessage(message: Omit<CollaborationMessage, 'sender' | 'timestamp'>): void {
    if (!this.socket || !this.session) {
      throw new Error('Not connected to collaboration server');
    }

    this.socket.emit('message', {
      ...message,
      timestamp: Date.now(),
    });
  }

  updatePlaybackState(currentTime: number, isPlaying: boolean): void {
    this.sendMessage({
      type: 'playback',
      data: { currentTime, isPlaying },
    });
  }

  addAnnotation(annotation: Annotation): void {
    this.sendMessage({
      type: 'annotation',
      data: annotation,
    });
  }

  updateAnnotation(annotation: Annotation): void {
    this.sendMessage({
      type: 'annotation',
      data: annotation,
    });
  }

  deleteAnnotation(annotationId: string): void {
    this.sendMessage({
      type: 'annotation',
      data: { id: annotationId, action: 'delete' },
    });
  }
}
