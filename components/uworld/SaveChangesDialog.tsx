import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SaveChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

const SaveChangesDialog = ({
  isOpen,
  onClose,
  onSave,
  onDiscard,
}: SaveChangesDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-black">Unsaved Changes</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">
            You have unsaved changes. Would you like to save them before closing?
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onDiscard}
            className="px-4 py-2 bg-gray-100 text-black rounded-lg transition-all shadow-sm hover:shadow-md hover:bg-gray-200"
          >
            Don&apos;t Save
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveChangesDialog; 