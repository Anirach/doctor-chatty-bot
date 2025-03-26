
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

export interface Message {
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  isTyping?: boolean;
  graph?: any; // Add graph property for data visualization
}

export interface N8nResponse {
  success: boolean;
  response: string;
  graph?: any;
}

export interface WebhookConfig {
  url: string;
  connected: boolean;
}
