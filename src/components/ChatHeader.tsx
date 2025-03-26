
import React from "react";
import { MoreVertical, Settings, Trash, History, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ChatHeaderProps {
  onOpenSettings: () => void;
  onClearChat: () => void;
  webhookConnected: boolean;
  messages: any[];
  showMenuButtons?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onOpenSettings,
  onClearChat,
  webhookConnected,
  messages,
  showMenuButtons = true // Default to true for backward compatibility
}) => {
  return (
    <header className="px-4 py-3 border-b flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-medium">AI Assistant</h1>
        <Badge
          variant={webhookConnected ? "default" : "destructive"}
          className={`${
            webhookConnected ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {webhookConnected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
        </Badge>
      </div>

      {showMenuButtons && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenSettings}
            title="ตั้งค่า"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onClearChat}
            title="ล้างการสนทนา"
          >
            <Trash className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/history" className="cursor-pointer">
                  <History className="h-4 w-4 mr-2" />
                  ประวัติการสนทนา
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/" className="cursor-pointer text-red-500">
                  <LogOut className="h-4 w-4 mr-2" />
                  ออกจากระบบ
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      {!showMenuButtons && (
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSettings}
          title="ตั้งค่า"
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </header>
  );
};

export default ChatHeader;
