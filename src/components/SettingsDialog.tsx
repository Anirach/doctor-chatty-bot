
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WebhookConfig } from "@/types/chat";
import { toast } from "sonner";

// Default n8n webhook URL
const DEFAULT_WEBHOOK_URL = "https://amk-n8n.proen.app.ruk-com.cloud/webhook/bf4dd093-bb02-472c-9454-7ab9af97bd1d";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhookConfig: WebhookConfig;
  onSaveWebhook: (config: WebhookConfig) => void;
}

const SettingsDialog = ({
  open,
  onOpenChange,
  webhookConfig,
  onSaveWebhook,
}: SettingsDialogProps) => {
  // Initialize with the provided webhook URL or fall back to the default if empty
  const [url, setUrl] = useState(webhookConfig.url || DEFAULT_WEBHOOK_URL);
  const [testLoading, setTestLoading] = useState(false);
  
  const handleSave = () => {
    onSaveWebhook({
      url: url.trim(),
      connected: webhookConfig.connected,
    });
    toast.success("Settings saved successfully");
    onOpenChange(false);
  };
  
  const testConnection = async () => {
    if (!url.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }
    
    setTestLoading(true);
    try {
      const testMessage = {
        message: "This is a test message from the Doctor Chatbot",
        timestamp: new Date().toISOString(),
        source: "doctor-chatbot-test",
      };
      
      const response = await fetch(url.trim(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testMessage),
      });
      
      if (response.ok) {
        toast.success("Connection successful!");
        onSaveWebhook({
          url: url.trim(),
          connected: true,
        });
      } else {
        toast.error("Connection failed. Please check your webhook URL.");
        onSaveWebhook({
          url: url.trim(),
          connected: false,
        });
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("Connection failed. Please check your webhook URL.");
      onSaveWebhook({
        url: url.trim(),
        connected: false,
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Reset button handler
  const handleResetToDefault = () => {
    setUrl(DEFAULT_WEBHOOK_URL);
    toast.info("URL reset to default");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] animate-fade-in">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your n8n webhook to process patient messages
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">n8n Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                placeholder="https://your-n8n-instance.com/webhook/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetToDefault}
                title="Reset to default URL"
              >
                Reset
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the webhook URL from your n8n workflow that will process the patient messages
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between">
          <div className="flex-1">
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={testLoading || !url.trim()}
              className="relative"
            >
              {testLoading ? "Testing..." : "Test Connection"}
              {webhookConfig.connected && !testLoading && (
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 h-2 w-2 rounded-full bg-green-500"></span>
              )}
            </Button>
          </div>
          <Button onClick={handleSave} disabled={!url.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
