import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CalendarActivityData) => void;
  selectedDate: Date | null;
}

interface CalendarActivityData {
  activityTitle: string;
  activityText: string;
  hours: number;
  activityType: string;
  link?: string | null;
  scheduledDate: string;
  categoryId?: string;
  contentId?: string;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSubmit, selectedDate }) => {
  const [eventData, setEventData] = useState<CalendarActivityData>({
    activityTitle: '',
    activityText: '',
    hours: 1,
    activityType: 'Study',
    link: '',
    scheduledDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    categoryId: '',
    contentId: '',
  });

  useEffect(() => {
    if (isOpen) {
      setEventData({
        activityTitle: '',
        activityText: '',
        hours: 1,
        activityType: 'Study',
        link: '',
        scheduledDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        categoryId: '',
        contentId: '',
      });
    }
  }, [isOpen, selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: name === 'hours' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(eventData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Add New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
          <div className="space-y-2">
            <Label htmlFor="activityTitle" className="text-gray-900">Event Title</Label>
            <Input
              id="activityTitle"
              name="activityTitle"
              value={eventData.activityTitle}
              onChange={handleChange}
              placeholder="Enter event title"
              required
              className="text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activityText" className="text-gray-900">Event Description</Label>
            <Textarea
              id="activityText"
              name="activityText"
              value={eventData.activityText}
              onChange={handleChange}
              placeholder="Enter event description"
              required
              className="text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours" className="text-gray-900">Duration (hours)</Label>
            <Input
              type="number"
              id="hours"
              name="hours"
              value={eventData.hours}
              onChange={handleChange}
              placeholder="Enter duration"
              required
              min="0.5"
              step="0.5"
              className="text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activityType" className="text-gray-900">Activity Type</Label>
            <Select name="activityType" value={eventData.activityType} onValueChange={(value) => handleChange({ target: { name: 'activityType', value } })}>
              <SelectTrigger className="text-gray-900">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Study">Study</SelectItem>
                <SelectItem value="Practice">Practice</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                {/* Add more options as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link" className="text-gray-900">Related Link (optional)</Label>
            <Input
              id="link"
              name="link"
              value={eventData.link || ''}
              onChange={handleChange}
              placeholder="Enter related link"
              className="text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900">Scheduled Date</Label>
            <Input
              value={eventData.scheduledDate}
              readOnly
              className="bg-muted text-gray-900"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="text-gray-800">
              Cancel
            </Button>
            <Button type="submit" className="text-white bg-gray-900 hover:bg-gray-800">Add Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;
