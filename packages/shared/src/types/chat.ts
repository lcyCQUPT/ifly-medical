export interface ChatMessage {
  id: number;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  sessionId: string;
  lastMessage: string;
  createdAt: string;
}
