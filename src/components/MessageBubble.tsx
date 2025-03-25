import React, { useEffect, useRef } from "react";
import { UserCircle, StethoscopeIcon } from "lucide-react";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/chat-utils";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
}

const MessageBubble = ({ message, isLatest }: MessageBubbleProps) => {
  const isDoctor = message.role === "doctor";
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isLatest && bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLatest, message.content]);

  return (
    <div
      ref={bubbleRef}
      className={cn(
        "flex gap-3 mb-4 message-appear",
        isDoctor ? "justify-start" : "justify-end"
      )}
    >
      {isDoctor && (
        <div className="flex-shrink-0 mt-1">
          <div className="h-10 w-10 rounded-full bg-doctor-light flex items-center justify-center">
            <StethoscopeIcon className="h-6 w-6 text-doctor-dark" />
          </div>
        </div>
      )}
      
      <div className={cn(
        "max-w-[80%] px-4 py-3 rounded-2xl shadow-sm",
        isDoctor 
          ? "bg-doctor-light text-doctor-dark rounded-tl-sm" 
          : "bg-patient-light text-gray-800 rounded-tr-sm"
      )}>
        {message.isTyping ? (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <>
            <div className="mb-1 prose prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            <div className={cn(
              "text-xs opacity-70",
              isDoctor ? "text-doctor-dark" : "text-gray-600"
            )}>
              {formatMessageTime(message.timestamp)}
            </div>
          </>
        )}
      </div>
      
      {!isDoctor && (
        <div className="flex-shrink-0 mt-1">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <UserCircle className="h-7 w-7 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
