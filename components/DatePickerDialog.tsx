import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DatePickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  currentDate?: Date;
  testName?: string;
}

const DatePickerDialog: React.FC<DatePickerDialogProps> = ({
  isOpen,
  onClose,
  onDateSelect,
  currentDate,
  testName
}) => {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    currentDate?.toISOString().split('T')[0]
  );

  // Update selected date when currentDate changes
  useEffect(() => {
    if (currentDate) {
      setSelectedDate(currentDate.toISOString().split('T')[0]);
    }
  }, [currentDate]);

  const handleSave = () => {
    if (selectedDate) {
      // Create date at the selected day at noon UTC
      const [year, month, day] = selectedDate.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      onDateSelect(date);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[40rem] bg-[#f8fafc] text-black">
        <DialogHeader>
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-2xl font-bold text-black">
              Schedule Test Date
            </DialogTitle>
            <div className="text-[0.7rem] text-gray-400 italic">
              Select a date for {testName || 'your practice test'}
            </div>
          </div>
        </DialogHeader>
        <div className="bg-[#8e9aab] bg-opacity-10 p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="space-y-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Test Date</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 bg-white"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedDate}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatePickerDialog; 