
export interface Message {
  id: string;
  content: string;
  role: 'patient' | 'doctor';
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookConfig {
  url: string;
  connected: boolean;
}

export interface N8nResponse {
  response: string;
  success: boolean;
  metadata?: {
    suggestedFollowUp?: string[];
    confidence?: number;
    sourceInfo?: string;
  }
}
