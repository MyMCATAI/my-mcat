import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarEvent, ReplacementData } from '@/types/calendar';

interface ReplaceEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (replacementData: ReplacementData) => void;
  event: CalendarEvent | null;
}

const EVENT_CATEGORIES = [
  {
    name: 'MyMCAT Daily CARs',
    duration: 0.5,
    type: 'Practice',
  },
  {
    name: 'AAMC CARs',
    duration: 0.5,
    type: 'Practice',
  },
  {
    name: 'Adaptive Tutoring Suite',
    duration: 1,
    type: 'Review',
  },
  {
    name: 'Anki Clinic',
    duration: 0.5,
    type: 'Review',
  },
  {
    name: 'Regular Anki',
    duration: 0.5,
    type: 'Review',
  },
  {
    name: 'UWorld',
    duration: 1,
    type: 'practice',
  },
  {
    name: 'AAMC Materials',
    duration: 2,
    type: 'practice',
  }
].filter(category => !category.name.toLowerCase().includes('test'));

const ReplaceEventModal: React.FC<ReplaceEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  event,
}) => {
  const [replacementData, setReplacementData] = useState<ReplacementData>({
    taskType: '',
    replacementScope: 'single',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(replacementData);
    
    // Trigger immediate refresh of calendar activities
    try {
      await Promise.all([
        fetch('/api/calendar/exam-activities'),
        fetch('/api/calendar-activity')
      ]);
    } catch (error) {
      console.error('Failed to refresh activities:', error);
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] md:w-[30rem] p-4 max-h-[90vh] flex flex-col focus-visible:outline-none focus:outline-none outline-none">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Replace Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 flex-1 overflow-y-auto">
          {/* Current Event Details */} 
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">Current Event</h3>
            <div className="text-sm">
              <p><span className="font-medium">Title:</span> {event?.title}</p>
              <p><span className="font-medium">Date:</span> {event?.start.toLocaleDateString()}</p>
            </div>
          </div>

          {/* Task Selection */}
          <div className="space-y-2">
            <Label htmlFor="taskType" className="text-gray-900">Replace with Task</Label>
            <Select
              name="taskType"
              value={replacementData.taskType}
              onValueChange={(value) => setReplacementData(prev => ({ ...prev, taskType: value }))}
            >
              <SelectTrigger className="w-full border border-gray-200 rounded-lg px-4 py-2 text-left bg-white hover:bg-gray-50 transition-colors ring-0 ring-offset-0 outline-none focus:outline-none focus-visible:outline-none">
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg ring-0 ring-offset-0 outline-none focus:outline-none focus-visible:outline-none">
                {EVENT_CATEGORIES.map((category) => (
                  <SelectItem 
                    key={category.name} 
                    value={category.name}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer outline-none focus:outline-none focus-visible:outline-none"
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Replacement Scope */}
          <div className="space-y-2">
            <Label className="text-gray-900">Replacement Scope</Label>
            <RadioGroup
              value={replacementData.replacementScope}
              onValueChange={(value: 'single' | 'future') => 
                setReplacementData(prev => ({ ...prev, replacementScope: value }))
              }
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">Replace only this event</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="future" id="future" />
                <Label htmlFor="future">Replace this and all future occurrences</Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter className="flex flex-row gap-2 mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 ease-in-out"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600/90 rounded-md hover:bg-blue-600 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!replacementData.taskType}
            >
              Replace Event
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReplaceEventModal;