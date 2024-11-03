import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from 'lucide-react';
import { useRouter } from "next/navigation";

interface Task {
  text: string;
  completed: boolean;
}

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CalendarActivityData) => void;
  onDelete: (eventId: string) => void;
  event: CalendarEvent | null;
  handleSetTab: (tab: string) => void;
  onTasksUpdate?: (eventId: string, tasks: Task[]) => void;
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
  tasks: Task[];
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
  tasks?: Task[];
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  event,
  handleSetTab,
  onTasksUpdate,
}) => {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [eventData, setEventData] = useState<CalendarActivityData>({
    activityTitle: '',
    activityText: '',
    hours: 1,
    activityType: '',
    link: '',
    scheduledDate: '',
    tasks: [],
  });

  useEffect(() => {
    if (event) {
      setEventData(prev => ({
        ...prev,
        activityTitle: event.title,
        activityText: event.activityText,
        hours: event.hours,
        activityType: event.activityType || '',
        link: event.link || '',
        scheduledDate: event.start.toISOString().split('T')[0],
        tasks: Array.isArray(event.tasks) ? event.tasks : []
      }));

      setTasks(Array.isArray(event.tasks) ? event.tasks : []);
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: name === 'hours' ? parseFloat(value) : value }));
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      const newTasks = [...tasks, { text: newTask.trim(), completed: false }];
      setTasks(newTasks);
      setEventData(prev => ({ ...prev, tasks: newTasks }));
      setNewTask('');
      
      if (event?.id && onTasksUpdate) {
        onTasksUpdate(event.id, newTasks);
      }
    }
  };

  const handleRemoveTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    setEventData(prev => ({ ...prev, tasks: newTasks }));
    
    if (event?.id && onTasksUpdate) {
      onTasksUpdate(event.id, newTasks);
    }
  };

  const handleTaskCompletion = (index: number, completed: boolean) => {
    const updatedTasks = tasks.map((task, i) => 
      i === index ? { ...task, completed } : task
    );
    setTasks(updatedTasks);
    setEventData(prev => ({ ...prev, tasks: updatedTasks }));
    
    if (event?.id && onTasksUpdate) {
      onTasksUpdate(event.id, updatedTasks);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedEventData = {
      ...eventData,
      tasks: tasks
    };
    onSubmit(updatedEventData);
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

  const handleNavigation = (activityTitle: string) => {
    switch (activityTitle) {
      case "Daily CARS Practice":
        handleSetTab("test");
        break;
      case "Anki Clinic":
        router.push("/doctorsoffice");
        break;
      case "Adaptive Tutoring Suite":
        handleSetTab("KnowledgeProfile");
        break;
      default:
        break;
    }
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] p-4 max-h-[90vh] flex flex-col">
        {isEditMode ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-gray-900">Edit Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 flex-1 overflow-y-auto">
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
              <div className="space-y-4">
                <Label className="text-gray-900">Tasks</Label>
                <div className="space-y-2">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => handleTaskCompletion(index, checked as boolean)}
                        id={`task-edit-${index}`}
                      />
                      <label htmlFor={`task-edit-${index}`} className="flex-grow">
                        {task.text}
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTask(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new task"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                  />
                  <Button type="button" onClick={handleAddTask}>
                    <Plus size={16} />
                  </Button>
                </div>
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
          <div className="space-y-4 text-gray-800 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
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
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Tasks:</h3>
                {tasks.length > 0 ? (
                  <ul className="space-y-2">
                    {tasks.map((task, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => handleTaskCompletion(index, checked as boolean)}
                          id={`task-view-${index}`}
                        />
                        <label htmlFor={`task-view-${index}`}>
                          {task.text}
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No tasks assigned</p>
                )}
              </div>
            </div>
            <DialogFooter className="flex flex-row gap-2 mt-4 w-full justify-between">
              
              {event?.title &&
              <Button 
                type="button" 
                onClick={() => handleNavigation(event?.title)}
                className="text-white bg-gray-900 hover:bg-gray-800"
              >
                Go to Activity
              </Button>}
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
