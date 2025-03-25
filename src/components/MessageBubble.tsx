import React, { useEffect, useRef, useState } from "react";
import { UserCircle, StethoscopeIcon, Maximize2 } from "lucide-react";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/chat-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
}

const MessageBubble = ({ message, isLatest }: MessageBubbleProps) => {
  const isDoctor = message.role === "doctor";
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [hasTable, setHasTable] = useState(false);
  
  useEffect(() => {
    if (isLatest && bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLatest, message.content]);

  const renderMarkdown = (content: string, isDialog: boolean = false) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => {
            setHasTable(true);
            return (
              <div className="relative">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse my-4">
                    {children}
                  </table>
                </div>
                {!isDialog && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="absolute top-2 right-2 p-1 rounded-full bg-white/80 shadow-sm hover:bg-white transition-colors">
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
                      <div className="prose prose-sm max-w-none">
                        {renderMarkdown(content, true)}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            );
          },
          th: ({ children }) => (
            <th className="border border-gray-300 px-4 py-2 bg-gray-100">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-4 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

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
              {renderMarkdown(message.content)}
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
