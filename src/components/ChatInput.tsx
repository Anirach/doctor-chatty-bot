
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSendMessage, isProcessing, placeholder = "Type your message..." }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + "px";
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      onSendMessage(message.trim());
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative glass rounded-xl p-1 transition-all duration-200 animate-fade-in",
        isProcessing ? "opacity-70" : "opacity-100"
      )}
    >
      <div className="flex items-end rounded-lg border bg-white/80 shadow-sm">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isProcessing}
          className={cn(
            "flex-1 resize-none border-0 bg-transparent px-4 py-3 h-12 max-h-[120px] outline-none focus:ring-0",
            "placeholder:text-gray-400 text-gray-800",
            "transition-all duration-200",
            isProcessing ? "opacity-50" : "opacity-100"
          )}
          style={{ minHeight: "48px" }}
        />
        <Button
          type="submit"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full mr-2 mb-1",
            "bg-doctor transition-all duration-200",
            message.trim() && !isProcessing 
              ? "opacity-100" 
              : "opacity-50 cursor-not-allowed"
          )}
          disabled={!message.trim() || isProcessing}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
