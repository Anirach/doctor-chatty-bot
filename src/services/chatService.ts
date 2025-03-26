
import { Chat, ChatHistory, Message } from '@/types/chat';

const STORAGE_KEY = 'chat_history';

export const chatService = {
  // บันทึกการสนทนาใหม่
  saveChat: (messages: Message[]) => {
    const currentTime = new Date();
    const formattedTime = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')} ${String(currentTime.getDate()).padStart(2, '0')}/${String(currentTime.getMonth() + 1).padStart(2, '0')}/${String(currentTime.getFullYear()).slice(-2)}`;
    
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
