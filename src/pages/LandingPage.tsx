import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { StethoscopeIcon } from "lucide-react";
import { chatService } from "@/services/chatService";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    // สร้างบทสนทนาใหม่
    chatService.saveChat([]);
    // นำทางไปยังหน้าแชท
    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-doctor-light flex items-center justify-center">
            <StethoscopeIcon className="h-12 w-12 text-doctor" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Dr. Assistant</h1>
          <p className="text-xl text-gray-600">
            ผู้ช่วยแพทย์อัจฉริยะของคุณ พร้อมให้คำปรึกษาและตอบคำถามเกี่ยวกับสุขภาพ
          </p>
        </div>

        <div className="pt-4">
          <Button 
            size="lg" 
            className="bg-doctor hover:bg-doctor/90 text-white px-8 py-6 text-lg"
            onClick={handleStartChat}
          >
            เริ่มต้นแชท
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 