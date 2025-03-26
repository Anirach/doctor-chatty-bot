
import React from "react";
import ChatContainer from "../components/ChatContainer";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import ChatSidebar from "@/components/ChatSidebar";

const ChatPage = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <main className="h-screen flex bg-gradient-to-br from-blue-50 to-white">
        <ChatSidebar />
        <div className="flex-1 h-screen overflow-hidden">
          <ChatContainer />
        </div>
        <SidebarRail />
      </main>
    </SidebarProvider>
  );
};

export default ChatPage;
