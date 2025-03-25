import React from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/chat-utils";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

const Sidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: SidebarProps) => {
  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          <span>แชทใหม่</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors",
                currentSessionId === session.id && "bg-gray-100"
              )}
              onClick={() => onSelectSession(session.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {session.title || "แชทใหม่"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {session.lastMessage}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t text-xs text-gray-500">
        {sessions.length > 0 && (
          <div>อัพเดทล่าสุด: {formatDate(sessions[0].timestamp)}</div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 