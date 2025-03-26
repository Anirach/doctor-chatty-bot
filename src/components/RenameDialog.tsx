
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  onSave: (newName: string) => void;
}

const RenameDialog: React.FC<RenameDialogProps> = ({
  open,
  onOpenChange,
  initialName,
  onSave
}) => {
  const [name, setName] = useState(initialName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขชื่อการสนทนา</DialogTitle>
          <DialogDescription>
            กรุณาใส่ชื่อใหม่สำหรับการสนทนานี้
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-y-2 py-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ชื่อการสนทนา"
            className="w-full"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button type="button" onClick={handleSave}>
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameDialog;
