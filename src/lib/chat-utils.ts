import { Message, N8nResponse } from "@/types/chat";

// Generate unique IDs for messages
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Format the current date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('th-TH', {
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
    return new Intl.DateTimeFormat('th-TH', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date());
  }
  
  return new Intl.DateTimeFormat('th-TH', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

// Send message to n8n webhook
export async function sendToN8n(message: string, webhookUrl: string): Promise<N8nResponse> {
  try {
    if (!webhookUrl) {
      throw new Error('Webhook URL is not configured');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response from n8n:', data);
    
    // ตรวจสอบรูปแบบข้อมูลที่เป็น array และมี output
    let responseText = '';
    let graphData = null;

    if (Array.isArray(data) && data.length > 0) {
      if (data[0].output) {
        responseText = data[0].output;
      }
      if (data[0].graph) {
        graphData = data[0].graph;
      }
    } else if (typeof data === 'string') {
      responseText = data;
    } else if (data.response) {
      responseText = data.response;
      if (data.graph) {
        graphData = data.graph;
      }
    } else if (data.message) {
      responseText = data.message;
      if (data.graph) {
        graphData = data.graph;
      }
    } else if (data.text) {
      responseText = data.text;
      if (data.graph) {
        graphData = data.graph;
      }
    } else {
      responseText = JSON.stringify(data);
    }

    return {
      success: true,
      response: responseText,
      graph: graphData,
    };
  } catch (error) {
    console.error('Error sending message to n8n:', error);
    return {
      success: false,
      response: error instanceof Error 
        ? `ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ: ${error.message}`
        : "ขออภัย ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
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

// Get list of all chat sessions
export function getSessionList(): string[] {
  try {
    const sessions = localStorage.getItem('chat-sessions');
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error getting session list:', error);
    return [];
  }
}

// Delete a chat session
export function deleteChatSession(sessionId: string): void {
  try {
    localStorage.removeItem(`chat-session-${sessionId}`);
    const sessions = getSessionList();
    const updatedSessions = sessions.filter(id => id !== sessionId);
    localStorage.setItem('chat-sessions', JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error deleting chat session:', error);
  }
}

// Get session details
export function getSessionDetails(sessionId: string): { title: string; lastMessage: string; timestamp: Date } {
  const messages = getChatSession(sessionId);
  const lastMessage = messages[messages.length - 1];
  
  return {
    title: messages[0]?.content.slice(0, 30) + (messages[0]?.content.length > 30 ? '...' : '') || 'แชทใหม่',
    lastMessage: lastMessage?.content.slice(0, 50) + (lastMessage?.content.length > 50 ? '...' : '') || '',
    timestamp: lastMessage?.timestamp || new Date(),
  };
}
