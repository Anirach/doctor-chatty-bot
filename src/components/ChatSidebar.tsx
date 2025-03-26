
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { 
  MessageSquare, 
  Plus, 
  History as HistoryIcon, 
  Settings, 
  Trash2, 
  LogOut,
  MoreVertical,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatService } from "@/services/chatService";
import { ChatHistory } from "@/types/chat";
import { formatDate } from "@/lib/chat-utils";
import { cn } from "@/lib/utils";
import RenameDialog from "./RenameDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatSidebarProps {
  onSelectChat?: (chatId: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onSelectChat }) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedChatForRename, setSelectedChatForRename] = useState<ChatHistory | null>(null);
  const navigate = useNavigate();

  // Load chat history
  useEffect(() => {
    const history = chatService.getChatHistory();
    setChatHistory(history);
    
    // Set current chat if there's history
    if (history.length > 0 && !currentChatId) {
      setCurrentChatId(history[0].id);
    }
  }, [currentChatId]);

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    navigate(`/chat/${chatId}`);
    if (onSelectChat) {
      onSelectChat(chatId);
    }
  };

  const handleNewChat = () => {
    navigate("/chat");
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    chatService.deleteChat(id);
    
    // Refresh history
    const history = chatService.getChatHistory();
    setChatHistory(history);
    
    // If we deleted the current chat, navigate to a new chat
    if (id === currentChatId) {
      navigate("/chat");
    }
  };

  const handleOpenRenameDialog = (chat: ChatHistory, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChatForRename(chat);
    setRenameDialogOpen(true);
  };

  const handleRenameChat = (newName: string) => {
    if (selectedChatForRename) {
      chatService.renameChat(selectedChatForRename.id, newName);
      // Refresh history
      const history = chatService.getChatHistory();
      setChatHistory(history);
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center p-2">
            <Button
              onClick={handleNewChat}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              <span>แชทใหม่</span>
            </Button>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>การสนทนา</SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-[400px]">
                <SidebarMenu>
                  {chatHistory.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        isActive={currentChatId === chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                        tooltip={chat.title}
                        className="flex items-start w-full pr-10"
                      >
                        <MessageSquare className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0 ml-2">
                          <div className="text-sm font-medium truncate">
                            {chat.title}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => handleOpenRenameDialog(chat, e as unknown as React.MouseEvent)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>แก้ไขชื่อ</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-500 focus:text-red-500" 
                              onClick={(e) => handleDeleteChat(chat.id, e as unknown as React.MouseEvent)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>ลบ</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {chatHistory.length === 0 && (
                    <div className="text-center text-gray-500 p-4">
                      ไม่มีประวัติการสนทนา
                    </div>
                  )}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/history">
                  <HistoryIcon className="h-4 w-4" />
                  <span>ประวัติการสนทนา</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate("/")}>
                <LogOut className="h-4 w-4" />
                <span>ออกจากระบบ</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {selectedChatForRename && (
        <RenameDialog 
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          initialName={selectedChatForRename.title}
          onSave={handleRenameChat}
        />
      )}
    </>
  );
};

export default ChatSidebar;
