import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface ResetConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (result: { success: boolean; action: 'reset' }) => Promise<boolean>;
}

const CONFIRMATION_TEXT = "Reset my full schedule";

const ResetConfirmDialog: React.FC<ResetConfirmDialogProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const isConfirmed = confirmationInput.toLowerCase() === CONFIRMATION_TEXT.toLowerCase();

  const handleReset = async () => {
    if (!isConfirmed) {
      toast.error('Please type the confirmation text exactly as shown');
      return;
    }

    try {
      // Delete all calendar activities
      const response = await fetch('/api/calendar-activity/reset', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset calendar activities');
      }

      // Clear local storage
      localStorage.removeItem('studySchedule');

      // Notify parent to refresh
      if (onComplete) {
        await onComplete({ success: true, action: 'reset' });
      }

      // Show success message
      toast.success('Schedule reset. Please set up your new exam schedule.');
      
      // Reset confirmation input
      setConfirmationInput('');
      
      // Close only this dialog
      onClose();
    } catch (error) {
      console.error('Failed to reset schedule:', error);
      toast.error('Failed to reset schedule. Please try again.');
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-[--theme-mainbox-color] rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-[--theme-text-color] mb-2 text-center">⚠️ Reset Entire Schedule?</h3>
        <div className="space-y-4 mb-6">
          <p className="text-[--theme-text-color] opacity-70">
            This will permanently delete:
          </p>
          <ul className="list-disc pl-5 text-[--theme-text-color] opacity-70 space-y-1">
            <li>All your scheduled MCAT exams</li>
            <li>Your entire study schedule</li>
            <li>All calendar activities</li>
          </ul>
          <div className="pt-2">
            <p className="text-[--theme-text-color] font-medium mb-2">
              To confirm, type: <span className="text-[--theme-hover-color]">{CONFIRMATION_TEXT}</span>
            </p>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Type confirmation text here"
              className="w-full p-2 rounded-md bg-transparent border border-[--theme-border-color] text-[--theme-text-color] placeholder:text-[--theme-text-color]/50 focus:outline-none focus:border-[--theme-hover-color]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReset}
            variant="destructive"
            size="sm"
            disabled={!isConfirmed}
            className={!isConfirmed ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Reset Everything
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmDialog; 