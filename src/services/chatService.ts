
import { Chat, ChatHistory, Message } from '@/types/chat';

const STORAGE_KEY = 'chat_history';

export const chatService = {
  // บันทึกการสนทนาใหม่
  saveChat: (messages: Message[]) => {
    const currentTime = new Date();
    const formattedTime = formatTimestampTitle(currentTime);
    
    const chat: Chat = {
      id: Date.now().toString(),
      title: formattedTime, // Use formatted timestamp as title
      messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const chats = chatService.getChats();
    chats.push(chat);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));

    return chat;
  },

  // ดึงรายการการสนทนาทั้งหมด
  getChats: (): Chat[] => {
    const chats = localStorage.getItem(STORAGE_KEY);
    return chats ? JSON.parse(chats) : [];
  },

  // ดึงรายการประวัติการสนทนา
  getChatHistory: (): ChatHistory[] => {
    const chats = chatService.getChats();
    return chats.map(chat => ({
      id: chat.id,
      title: chat.title,
      lastMessage: chat.messages[chat.messages.length - 1]?.content || '',
      timestamp: chat.updatedAt,
    }));
  },

  // ดึงการสนทนาตาม ID
  getChatById: (id: string): Chat | undefined => {
    const chats = chatService.getChats();
    return chats.find(chat => chat.id === id);
  },

  // ลบการสนทนา
  deleteChat: (id: string) => {
    const chats = chatService.getChats();
    const filteredChats = chats.filter(chat => chat.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredChats));
  },
  
  // เปลี่ยนชื่อการสนทนา
  renameChat: (id: string, newTitle: string) => {
    const chats = chatService.getChats();
    const chatIndex = chats.findIndex(chat => chat.id === id);
    
    if (chatIndex !== -1) {
      chats[chatIndex].title = newTitle;
      chats[chatIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
      return true;
    }
    
    return false;
  },
};

// Format timestamp as hr:min:dd:mm:yy
function formatTimestampTitle(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  
  return `${hours}:${minutes}:${day}:${month}:${year}`;
}
