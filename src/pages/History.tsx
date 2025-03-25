import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Trash2 } from "lucide-react";
import { chatService } from "@/services/chatService";
import { ChatHistory } from "@/types/chat";

const History = () => {
  const [chats, setChats] = React.useState<ChatHistory[]>([]);

  React.useEffect(() => {
    const loadChats = () => {
      const chatHistory = chatService.getChatHistory();
      setChats(chatHistory);
    };
    loadChats();
  }, []);

  const handleDeleteChat = (id: string) => {
    chatService.deleteChat(id);
    setChats(chatService.getChatHistory());
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">ประวัติการสนทนา</h1>
        </div>

        <div className="space-y-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <Link to={`/chat/${chat.id}`} className="block">
                    <h2 className="font-medium text-lg mb-1">{chat.title}</h2>
                    <p className="text-gray-600 text-sm mb-2">{chat.lastMessage}</p>
                    <p className="text-gray-400 text-xs">{new Date(chat.timestamp).toLocaleString('th-TH')}</p>
                  </Link>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteChat(chat.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              ไม่มีประวัติการสนทนา
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History; 