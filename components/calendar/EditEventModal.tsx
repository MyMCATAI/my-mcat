import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CalendarActivityData) => void;
  onDelete: (eventId: string) => void;
  event: CalendarEvent | null;
}

interface CalendarActivityData {
  activityTitle: string;
  activityText: string;
  hours: number;
  activityType: string;
  link?: string;
  scheduledDate: string;
  categoryId?: string;
  contentId?: string;
}

interface CalendarEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  activityText: string;
  hours: number;
  activityType?: string;
  link?: string | null;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  event
}) => {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [eventData, setEventData] = useState<CalendarActivityData>({
    activityTitle: '',
    activityText: '',
    hours: 1,
    activityType: '',
    link: '',
    scheduledDate: '',
    categoryId: '',
    contentId: '',
  });

  useEffect(() => {
    if (event) {
      setEventData({
        activityTitle: event.title,
        activityText: event.activityText,
        hours: event.hours,
        activityType: event.activityType || '',
        link: event.link || '',
        scheduledDate: event.start.toISOString().split('T')[0],
        categoryId: '',
        contentId: '',
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: name === 'hours' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(eventData);
    onClose();
  };

  const handleDelete = () => {
    if (event) {
      onDelete(event.id);
    }
  };

  const formatDuration = (hours: number) => {
    const minutes = Math.round(hours * 60);
    return `${minutes} minutes`;
  };

  useEffect(() => {
    if (!isOpen) {
      setIsEditMode(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] p-4">
        {isEditMode ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-gray-900">Edit Event</DialogTitle>
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
                  className="text-gray-900 w-full"
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
                  className="text-gray-900 w-full resize-y min-h-[100px]"
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
                  className="text-gray-900 w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activityType" className="text-gray-900">Activity Type</Label>
                <Select 
                  name="activityType" 
                  value={eventData.activityType} 
                  onValueChange={(value) => handleChange({ target: { name: 'activityType', value } } as any)}
                >
                  <SelectTrigger className="text-gray-900 w-full">
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Study">Study</SelectItem>
                    <SelectItem value="Practice">Practice</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="link" className="text-gray-900">Related Link (optional)</Label>
                <Input
                  id="link"
                  name="link"
                  value={eventData.link}
                  onChange={handleChange}
                  placeholder="Enter related link"
                  className="text-gray-900 w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900">Scheduled Date</Label>
                <Input
                  value={eventData.scheduledDate}
                  readOnly
                  className="bg-muted text-gray-900 w-full"
                />
              </div>
              <DialogFooter className="flex flex-row gap-2 mt-4 w-full justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose} 
                  className="text-gray-800 flex-1 min-w-[70px]">
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditMode(false)} 
                  className="text-gray-800 flex-1 min-w-[70px]">
                  View
                </Button>
                <Button 
                  type="submit" 
                  className="text-white bg-gray-900 hover:bg-gray-800 flex-1 min-w-[70px]">
                  Update
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDelete} 
                  className="text-gray-800 flex-1 min-w-[70px]">
                  Delete
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-gray-800">
            <div className="text-xl font-semibold">{eventData.activityTitle}</div>
            <div className="whitespace-pre-wrap">{eventData.activityText}</div>
            <div className="text-sm text-gray-600">
              Duration: {formatDuration(eventData.hours)}
            </div>
            {eventData.activityType && (
              <div className="text-sm text-gray-600">
                Type: {eventData.activityType}
              </div>
            )}
            {eventData.link && (
              <div className="text-sm">
                <a href={eventData.link} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline">
                  Link
                </a>
              </div>
            )}
            <div className="text-sm text-gray-600">
              Date: {new Date(eventData.scheduledDate).toLocaleDateString()}
            </div>
            <DialogFooter className="flex flex-row gap-2 mt-4 w-full justify-between">
              <Button 
                type="button" 
                onClick={() => setIsEditMode(true)}
                className="text-white bg-gray-900 hover:bg-gray-800 flex-1 min-w-[70px]">
                Edit
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                className="text-gray-800 flex-1 min-w-[70px]">
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditEventModal;
