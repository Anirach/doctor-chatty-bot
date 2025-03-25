import React from "react";
import { Button } from "@/components/ui/button";
import { StethoscopeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-doctor-light flex items-center justify-center">
            <StethoscopeIcon className="h-12 w-12 text-doctor-dark" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900">
          ยินดีต้อนรับสู่ Dr. Assistant
        </h1>
        
        <p className="text-lg text-gray-600">
          ผมคือผู้ช่วยแพทย์อัจฉริยะที่พร้อมให้คำปรึกษาและตอบคำถามเกี่ยวกับสุขภาพของคุณ
        </p>
        
        <div className="pt-4">
          <Button
            size="lg"
            className="bg-doctor hover:bg-doctor-dark text-white px-8 py-6 text-lg"
            onClick={() => navigate("/chat")}
          >
            เริ่มต้นแชท
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 