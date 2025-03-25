export interface Message {
  id: string;
  content: string;
  role: 'patient' | 'doctor';
  timestamp: Date;
  isTyping?: boolean;
  graph?: {
    type: 'line' | 'bar' | 'pie';
    data: any;
    options?: any;
  };
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
  success: boolean;
  response: string;
  graph?: {
    type: 'line' | 'bar' | 'pie';
    data: any;
    options?: any;
  };
  metadata?: {
    suggestedFollowUp?: string[];
    confidence?: number;
    sourceInfo?: string;
  }
}
