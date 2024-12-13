import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // You'll need to add this component

interface BreakPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void; // Define proper type based on your needs
}

const BreakPopup: React.FC<BreakPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const breakOptions = [
    { id: 'dayOff', label: 'Day Off' },
    { id: 'threeDays', label: 'Three Days Off' },
    { id: 'weekOff', label: 'Week Off' },
    { id: 'lighterWeek', label: 'Lighter Week' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-[--theme-background-color] p-6"
        style={{
          backgroundColor: 'var(--theme-leaguecard-color)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-[--theme-text-color]">
            Break Management
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Enable Switch */}
          <div className="flex items-center justify-between p-4 bg-[--theme-leaguecard-color] rounded-lg border-2 border-[--theme-border-color] shadow-md">
            <span className="text-[--theme-text-color] font-medium">Enable Break Planning</span>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              className="data-[state=checked]:bg-[--theme-hover-color]"
            />
          </div>

          {/* Date Options */}
          <div className="grid grid-cols-3 gap-4">
            {['Major Holidays', 'Enter Birthday', 'Enter Key Dates'].map((option) => (
              <button
                key={option}
                className="p-4 bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                          border-2 border-[--theme-border-color] rounded-lg
                          hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]
                          transition-colors duration-200 shadow-md"
              >
                {option}
              </button>
            ))}
          </div>

          {/* Break Options */}
          <div className="grid grid-cols-2 gap-4">
            {breakOptions.map((option) => (
              <button
                key={option.id}
                className="p-4 bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                          border-2 border-[--theme-border-color] rounded-lg
                          hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]
                          transition-colors duration-200 shadow-md"
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Date List */}
          <div className="bg-[--theme-leaguecard-color] p-4 rounded-lg border-2 border-[--theme-border-color] shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-grow bg-[--theme-input-bg] text-[--theme-text-color] 
                          border-2 border-[--theme-border-color] focus:border-[--theme-hover-color]"
              />
              <button
                className="px-4 py-2 bg-[--theme-hover-color] text-[--theme-hover-text] 
                          rounded-lg hover:opacity-90 transition-opacity"
              >
                Add Date
              </button>
            </div>
            
            <div className="max-h-48 overflow-y-auto themed-scrollbar">
              {/* Example dates - replace with your actual data */}
              {['2024-01-01', '2024-12-25'].map((date) => (
                <div 
                  key={date}
                  className="flex items-center justify-between p-2 mb-2 
                            bg-opacity-50 bg-[--theme-border-color] rounded-lg"
                >
                  <span className="text-[--theme-text-color]">{date}</span>
                  <button
                    className="text-[--theme-error-text] hover:opacity-80"
                    onClick={() => {/* Handle delete */}}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[--theme-text-color] hover:text-[--theme-hover-color]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit({enabled, /* other data */});
              onClose();
            }}
            className="px-4 py-2 bg-[--theme-hover-color] text-[--theme-hover-text] 
                      rounded-lg hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BreakPopup;