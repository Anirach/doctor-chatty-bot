import React, { useState, useEffect, useRef } from "react";
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
  const [sessions, setSessions] = useState<{ id: string; title: string; lastMessage: string; timestamp: Date }[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleNewChat = () => {
    const newSessionId = generateId();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: generateId(),
      content: "สวัสดีครับ ผมคือ Dr. Assistant มีอะไรให้ช่วยไหมครับ?",
      role: "doctor",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    saveChatSession(newSessionId, [welcomeMessage]);
    
    // Update sessions list
    const sessionDetails = getSessionDetails(newSessionId);
    setSessions(prev => [{ id: newSessionId, ...sessionDetails }, ...prev]);
  };

  // Load sessions
  useEffect(() => {
    const sessionIds = getSessionList();
    const sessionDetails = sessionIds.map(id => ({
      id,
      ...getSessionDetails(id)
    }));
    setSessions(sessionDetails);
    
    // Set current session to the most recent one or create new one
    if (sessionDetails.length > 0) {
      setCurrentSessionId(sessionDetails[0].id);
    } else {
      handleNewChat();
    }
  }, []);

  // Load messages for current session
  useEffect(() => {
    if (currentSessionId) {
      const savedMessages = getChatSession(currentSessionId);
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        // Add welcome message if this is a new session
        const welcomeMessage: Message = {
          id: generateId(),
          content: "สวัสดีครับ ผมคือ Dr. Assistant มีอะไรให้ช่วยไหมครับ?",
          role: "doctor",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        saveChatSession(currentSessionId, [welcomeMessage]);
      }
    }
  }, [currentSessionId]);

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0 && currentSessionId) {
      // Only save messages that aren't typing indicators
      const messagesToSave = messages.filter(msg => !msg.isTyping);
      saveChatSession(currentSessionId, messagesToSave);
      
      // Update sessions list
      const sessionDetails = getSessionDetails(currentSessionId);
      setSessions(prev => 
        prev.map(session => 
          session.id === currentSessionId ? { ...session, ...sessionDetails } : session
        )
      );
    }
  }, [messages, currentSessionId]);

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
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, patientMessage]);
    
    // Add typing indicator
    const typingIndicatorId = generateId();
    const typingIndicator: Message = {
      id: typingIndicatorId,
      content: "",
      role: "doctor",
      timestamp: new Date(),
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
            timestamp: new Date(),
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
        timestamp: new Date(),
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
        timestamp: new Date(),
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
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    saveChatSession(currentSessionId, [welcomeMessage]);
    
    toast({
      title: "ล้างแชทแล้ว",
      description: "ลบข้อความทั้งหมดเรียบร้อยแล้ว",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        onOpenSettings={() => setSettingsOpen(true)}
        onClearChat={handleClearChat}
        webhookConnected={webhookConfig.connected}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message}
            isLatest={index === messages.length - 1}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
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
