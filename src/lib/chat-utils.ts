
import { Message, N8nResponse } from "@/types/chat";

// Generate unique IDs for messages
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Format the current date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Format the timestamp for message display
export function formatMessageTime(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    // Handle invalid date by returning a placeholder or current time
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date());
  }
  
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

// Send message to n8n webhook
export async function sendToN8n(message: string, webhookUrl: string): Promise<N8nResponse> {
  try {
    console.log(`Sending message to n8n webhook: ${webhookUrl}`);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        timestamp: new Date().toISOString(),
        source: 'doctor-chatbot',
        query: message, // Add query field which might be expected by the webhook
        text: message,  // Add text field which might be expected by the webhook
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if the response is an array with at least one object that has an 'output' property
    if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('output')) {
      return {
        response: data[0].output || "I'm sorry, I couldn't process your request. Please try again.",
        success: true,
        metadata: data[0].metadata,
      };
    }
    
    // Fall back to the old response format if not an array with 'output'
    return {
      response: data.response || "I'm sorry, I couldn't process your request. Please try again.",
      success: true,
      metadata: data.metadata,
    };
  } catch (error) {
    console.error('Error communicating with n8n:', error);
    return {
      response: "I'm having trouble connecting to my knowledge base at the moment. Please try again in a few moments.",
      success: false,
    };
  }
}

// Store chat sessions in local storage
export function saveChatSession(sessionId: string, messages: Message[]): void {
  try {
    localStorage.setItem(`chat-session-${sessionId}`, JSON.stringify(messages));
    
    // Save to session list
    const sessions = getSessionList();
    if (!sessions.includes(sessionId)) {
      sessions.push(sessionId);
      localStorage.setItem('chat-sessions', JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Error saving chat session:', error);
  }
}

// Get chat session from local storage
export function getChatSession(sessionId: string): Message[] {
  try {
    const session = localStorage.getItem(`chat-session-${sessionId}`);
    return session ? JSON.parse(session) : [];
  } catch (error) {
    console.error('Error retrieving chat session:', error);
    return [];
  }
}

// Get list of all session IDs
export function getSessionList(): string[] {
  try {
    const sessions = localStorage.getItem('chat-sessions');
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error retrieving session list:', error);
    return [];
  }
}

// Clear a chat session
export function clearChatSession(sessionId: string): void {
  try {
    localStorage.removeItem(`chat-session-${sessionId}`);
    
    // Remove from session list
    const sessions = getSessionList().filter(id => id !== sessionId);
    localStorage.setItem('chat-sessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Error clearing chat session:', error);
  }
}
