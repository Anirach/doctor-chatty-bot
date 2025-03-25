
import React, { useState } from "react";
import { Settings, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StethoscopeIcon } from "lucide-react";

interface ChatHeaderProps {
  onClearChat: () => void;
  onOpenSettings: () => void;
  webhookConnected: boolean;
}

const ChatHeader = ({ onClearChat, onOpenSettings, webhookConnected }: ChatHeaderProps) => {
  return (
    <div className="glass rounded-xl p-3 mb-4 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-doctor-light flex items-center justify-center">
          <StethoscopeIcon className="h-6 w-6 text-doctor" />
        </div>
        <div>
          <h1 className="font-medium text-lg">Dr. Assistant</h1>
          <div className="flex items-center text-xs text-muted-foreground">
            <span className={`mr-1.5 h-2 w-2 rounded-full ${webhookConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            {webhookConnected ? 'Connected to n8n' : 'n8n connection not configured'}
          </div>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 animate-fade-in">
          <DropdownMenuItem onClick={onOpenSettings} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onClearChat} className="cursor-pointer text-red-500 focus:text-red-500">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Clear chat</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatHeader;
