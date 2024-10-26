import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, message, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Error</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-gray-800">
          {message}
        </div>
        <DialogFooter>
          <Button 
            onClick={onClose}
            className="text-white bg-gray-900 hover:bg-gray-800"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorModal; 