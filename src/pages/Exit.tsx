
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Exit = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">You've exited the chat</h1>
        <p className="text-gray-600 mb-6">
          Thank you for using Dr. Assistant. You can return to the chat or close this window.
        </p>
        <div className="flex justify-center">
          <Link to="/">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Chat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Exit;
