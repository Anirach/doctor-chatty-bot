import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import SettingsDialog from "./SettingsDialog";
import { Message, WebhookConfig } from "@/types/chat";
import { generateId, sendToN8n, saveChatSession, getChatSession } from "@/lib/chat-utils";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    url: localStorage.getItem("n8n-webhook-url") || "",
    connected: localStorage.getItem("n8n-webhook-connected") === "true",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>(generateId());
  const { toast } = useToast();

  // Load initial messages
  useEffect(() => {
    const savedMessages = getChatSession(sessionId.current);
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    } else {
      // Add welcome message if this is a new session
      const welcomeMessage: Message = {
        id: generateId(),
        content: "Hello! I'm Dr. Assistant. How can I help you today?",
        role: "doctor",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      saveChatSession(sessionId.current, [welcomeMessage]);
    }
  }, []);

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      // Only save messages that aren't typing indicators
      const messagesToSave = messages.filter(msg => !msg.isTyping);
      saveChatSession(sessionId.current, messagesToSave);
    }
  }, [messages]);

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
            content: "Please configure the n8n webhook URL in settings to enable doctor responses.",
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
          title: "Connection Error",
          description: "Unable to connect to n8n webhook. Please check your settings.",
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
        content: "I'm sorry, I'm having trouble processing your message. Please try again later.",
        role: "doctor",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your message. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearChat = () => {
    // Keep the welcome message
    const welcomeMessage: Message = {
      id: generateId(),
      content: "Hello! I'm Dr. Assistant. How can I help you today?",
      role: "doctor",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    saveChatSession(sessionId.current, [welcomeMessage]);
    
    toast({
      title: "Chat cleared",
      description: "All messages have been cleared.",
    });
  };

  const handleSaveWebhook = (config: WebhookConfig) => {
    setWebhookConfig(config);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-3xl mx-auto">
      <div className="flex-1 flex flex-col overflow-hidden p-4 chat-container">
        <ChatHeader 
          onClearChat={handleClearChat} 
          onOpenSettings={() => setSettingsOpen(true)}
          webhookConnected={webhookConfig.connected}
        />
        
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
          {messages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isLatest={index === messages.length - 1} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="mt-4">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isProcessing={isProcessing}
            placeholder="Describe your symptoms or ask a question..."
          />
        </div>
      </div>
      
      <SettingsDialog 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        webhookConfig={webhookConfig}
        onSaveWebhook={handleSaveWebhook}
      />
    </div>
  );
};

export default ChatContainer;
