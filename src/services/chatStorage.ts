import { ChatSession, ChatMessage } from '@/types';
import { format } from 'date-fns';

class ChatStorageService {
  private readonly STORAGE_KEY = 'rag_chat_sessions';
  private readonly MAX_SESSIONS = 50;

  // Get all chat sessions
  getSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  }

  // Get a specific session by ID
  getSession(sessionId: string): ChatSession | null {
    const sessions = this.getSessions();
    return sessions.find(session => session.id === sessionId) || null;
  }

  // Create a new chat session
  createSession(name: string, settings: ChatSession['settings']): ChatSession {
    const newSession: ChatSession = {
      id: this.generateId(),
      name,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      settings,
    };

    const sessions = this.getSessions();
    sessions.unshift(newSession);
    
    // Limit the number of sessions
    if (sessions.length > this.MAX_SESSIONS) {
      sessions.splice(this.MAX_SESSIONS);
    }
    
    this.saveSessions(sessions);
    return newSession;
  }

  // Update session name
  updateSessionName(sessionId: string, name: string): boolean {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return false;
    
    sessions[sessionIndex].name = name;
    sessions[sessionIndex].updatedAt = new Date();
    this.saveSessions(sessions);
    return true;
  }

  // Add a message to a session
  addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage | null {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return null;
    
    const newMessage: ChatMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date(),
    };
    
    sessions[sessionIndex].messages.push(newMessage);
    sessions[sessionIndex].updatedAt = new Date();
    this.saveSessions(sessions);
    
    return newMessage;
  }

  // Update session settings
  updateSessionSettings(sessionId: string, settings: Partial<ChatSession['settings']>): boolean {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return false;
    
    sessions[sessionIndex].settings = {
      ...sessions[sessionIndex].settings,
      ...settings,
    };
    sessions[sessionIndex].updatedAt = new Date();
    this.saveSessions(sessions);
    return true;
  }

  // Delete a session
  deleteSession(sessionId: string): boolean {
    const sessions = this.getSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    
    if (filteredSessions.length === sessions.length) return false;
    
    this.saveSessions(filteredSessions);
    return true;
  }

  // Clear all sessions
  clearAllSessions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Export sessions to JSON file
  exportSessions(): void {
    const sessions = this.getSessions();
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `rag-chat-sessions-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // Import sessions from JSON file
  importSessions(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const sessions = JSON.parse(content);
          
          // Validate the imported data
          if (Array.isArray(sessions) && sessions.every(this.isValidSession)) {
            this.saveSessions(sessions);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          console.error('Error importing sessions:', error);
          resolve(false);
        }
      };
      
      reader.readAsText(file);
    });
  }

  // Private methods
  private saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private isValidSession(session: any): session is ChatSession {
    return (
      session &&
      typeof session.id === 'string' &&
      typeof session.name === 'string' &&
      Array.isArray(session.messages) &&
      session.settings &&
      typeof session.settings.model === 'string' &&
      typeof session.settings.temperature === 'number' &&
      ['hybrid', 'semantic', 'keyword'].includes(session.settings.search_type)
    );
  }

  // Get session statistics
  getSessionStats(): {
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    oldestSession: Date | null;
    newestSession: Date | null;
  } {
    const sessions = this.getSessions();
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalMessages: 0,
        averageMessagesPerSession: 0,
        oldestSession: null,
        newestSession: null,
      };
    }

    const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
    const dates = sessions.map(s => s.createdAt).sort((a, b) => a.getTime() - b.getTime());

    return {
      totalSessions: sessions.length,
      totalMessages,
      averageMessagesPerSession: Math.round(totalMessages / sessions.length * 100) / 100,
      oldestSession: dates[0],
      newestSession: dates[dates.length - 1],
    };
  }
}

export const chatStorageService = new ChatStorageService();
