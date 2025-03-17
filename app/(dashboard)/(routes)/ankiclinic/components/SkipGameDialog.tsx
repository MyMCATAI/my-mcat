import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

interface SkipGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (correct: number, total: number) => void;
}

const SkipGameDialog: React.FC<SkipGameDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [correct, setCorrect] = useState<string>('10');
  const [total, setTotal] = useState<string>('10');

  const handleSubmit = () => {
    const correctNum = parseInt(correct);
    const totalNum = parseInt(total);

    // Validate inputs
    if (isNaN(correctNum) || isNaN(totalNum)) {
      toast.error('Please enter valid numbers');
      return;
    }

    if (correctNum < 0 || totalNum < 0) {
      toast.error('Numbers cannot be negative');
      return;
    }

    if (correctNum > totalNum) {
      toast.error('Correct answers cannot exceed total questions');
      return;
    }

    onConfirm(correctNum, totalNum);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] text-[--theme-text-color]">
        <DialogHeader>
          <DialogTitle>Skip Game</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="correct" className="text-right">
              Correct
            </Label>
            <Input
              id="correct"
              type="number"
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              className="col-span-3"
              min="0"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="total" className="text-right">
              Total
            </Label>
            <Input
              id="total"
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="col-span-3"
              min="0"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkipGameDialog; 