import React, { useState, useEffect } from 'react';

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
  link?: string;
  scheduledDate: string;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSubmit, selectedDate }) => {
  const [eventData, setEventData] = useState<CalendarActivityData>({
    activityTitle: '',
    activityText: '',
    hours: 1,
    activityType: '',
    link: '',
    scheduledDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
  });

  useEffect(() => {
    if (selectedDate) {
      setEventData(prev => ({
        ...prev,
        scheduledDate: selectedDate.toISOString().split('T')[0]
      }));
    }
  }, [selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: name === 'hours' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(eventData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Add New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="activityTitle"
            value={eventData.activityTitle}
            onChange={handleChange}
            placeholder="Event title"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <textarea
            name="activityText"
            value={eventData.activityText}
            onChange={handleChange}
            placeholder="Event description"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="number"
            name="hours"
            value={eventData.hours}
            onChange={handleChange}
            placeholder="Duration (hours)"
            required
            min="0.5"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <select
            name="activityType"
            value={eventData.activityType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select activity type</option>
            <option value="Study">Study</option>
            <option value="Practice">Practice</option>
            <option value="Review">Review</option>
            {/* Add more options as needed */}
          </select>
          <input
            type="url"
            name="link"
            value={eventData.link}
            onChange={handleChange}
            placeholder="Related link (optional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {eventData.scheduledDate}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
