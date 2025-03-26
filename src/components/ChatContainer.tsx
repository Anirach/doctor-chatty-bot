import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import SettingsDialog from "./SettingsDialog";
import { Message, WebhookConfig } from "@/types/chat";
import { generateId, sendToN8n, saveChatSession, getChatSession, getSessionList, deleteChatSession, getSessionDetails } from "@/lib/chat-utils";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    url: localStorage.getItem("n8n-webhook-url") || "",
    connected: localStorage.getItem("n8n-webhook-connected") === "true",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { id: chatId } = useParams<{ id: string }>();

  // Load messages for current session or create welcome message
  useEffect(() => {
    if (chatId) {
      // If there's a chat ID in the URL, load that chat
      const savedMessages = getChatSession(chatId);
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      }
    } else if (messages.length === 0) {
      // If no chat is loaded and no messages exist, add welcome message
      const welcomeMessage: Message = {
        id: generateId(),
        content: "สวัสดีครับ ผมคือ Dr. Assistant มีอะไรให้ช่วยไหมครับ?",
        role: "assistant",
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [chatId]);

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0 && chatId) {
      // Only save messages that aren't typing indicators
      const messagesToSave = messages.filter(msg => !msg.isTyping);
      saveChatSession(chatId, messagesToSave);
    }
  }, [messages, chatId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save webhook config when it changes
  useEffect(() => {
    localStorage.setItem("n8n-webhook-url", webhookConfig.url);
    localStorage.setItem("n8n-webhook-connected", webhookConfig.connected.toString());
  }, [webhookConfig]);

  const handleSendMessage = async (content: string) => {
    if (isProcessing) return;

    // Add patient message
    const patientMessage: Message = {
      id: generateId(),
      content,
      role: "patient",
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, patientMessage]);
    
    // Add typing indicator
    const typingIndicatorId = generateId();
    const typingIndicator: Message = {
      id: typingIndicatorId,
      content: "",
      role: "doctor",
      timestamp: new Date().toISOString(),
      isTyping: true,
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, typingIndicator]);
    }, 500);
    
    setIsProcessing(true);

    try {
      // Check if webhook is configured
      if (!webhookConfig.url) {
        // Remove typing indicator
        setTimeout(() => {
          setMessages(prev => 
            prev.filter(msg => msg.id !== typingIndicatorId)
          );
          
          // Add error message
          const errorMessage: Message = {
            id: generateId(),
            content: "กรุณาตั้งค่า n8n webhook URL ในส่วนตั้งค่าเพื่อให้สามารถตอบกลับได้",
            role: "doctor",
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, errorMessage]);
          
          // Open settings dialog
          setSettingsOpen(true);
        }, 1000);
        
        return;
      }

      // Send to n8n and get response
      const response = await sendToN8n(content, webhookConfig.url);
      
      // Remove typing indicator
      setMessages(prev => 
        prev.filter(msg => msg.id !== typingIndicatorId)
      );
      
      // Add doctor message
      const doctorMessage: Message = {
        id: generateId(),
        content: response.response,
        role: "doctor",
        timestamp: new Date().toISOString(),
      };
      
      // Add a small delay for natural conversation flow
      setTimeout(() => {
        setMessages(prev => [...prev, doctorMessage]);
      }, 300);
      
      // Update webhook connection status based on response
      if (!response.success && webhookConfig.connected) {
        setWebhookConfig(prev => ({ ...prev, connected: false }));
        toast({
          variant: "destructive",
          title: "การเชื่อมต่อล้มเหลว",
          description: "ไม่สามารถเชื่อมต่อกับ n8n webhook ได้ กรุณาตรวจสอบการตั้งค่า",
        });
      } else if (response.success && !webhookConfig.connected) {
        setWebhookConfig(prev => ({ ...prev, connected: true }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
      
      // Remove typing indicator
      setMessages(prev => 
        prev.filter(msg => msg.id !== typingIndicatorId)
      );
      
      // Add error message
      const errorMessage: Message = {
        id: generateId(),
        content: "ขออภัยครับ เกิดปัญหาในการประมวลผลข้อความ กรุณาลองใหม่อีกครั้ง",
        role: "doctor",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถประมวลผลข้อความได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearChat = () => {
    // Keep the welcome message
    const welcomeMessage: Message = {
      id: generateId(),
      content: "สวัสดีครับ ผมคือ Dr. Assistant มีอะไรให้ช่วยไหมครับ?",
      role: "doctor",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
    
    if (chatId) {
      saveChatSession(chatId, [welcomeMessage]);
    }
    
    toast({
      title: "ล้างแชทแล้ว",
      description: "ลบข้อความทั้งหมดเรียบร้อยแล้ว",
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <ChatHeader 
        onOpenSettings={() => setSettingsOpen(true)}
        onClearChat={handleClearChat}
        webhookConnected={webhookConfig.connected}
        messages={messages}
        showMenuButtons={false} // Hide menu buttons that are now in sidebar
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-blue-50/50 to-white">
        {messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message}
            isLatest={index === messages.length - 1}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-white">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isProcessing={isProcessing}
          placeholder="อธิบายอาการหรือถามคำถาม..."
        />
      </div>
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        webhookConfig={webhookConfig}
        onSaveWebhook={setWebhookConfig}
      />
    </div>
  );
};

export default ChatContainer;
