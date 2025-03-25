export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
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
