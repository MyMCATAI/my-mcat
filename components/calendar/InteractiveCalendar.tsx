'use client'

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, View, stringOrDate } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/CustomCalendar.css';

import { useUser } from "@clerk/nextjs";
import AddEventModal from './AddEventModal';

// Assuming you have a types file with this interface
interface FetchedActivity {
  id: string;
  scheduledDate: string;
  activityTitle: string;
  activityText: string;
  hours: number;
}

interface CalendarEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  activityText: string;
  hours: number;
}

const localizer = momentLocalizer(moment);

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

interface InteractiveCalendarProps {
  currentDate: Date;
  activities: FetchedActivity[];
  onDateChange: (date: Date) => void;
  getActivitiesForDate: (date: Date) => FetchedActivity[];
  onInteraction: () => void;
}

const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  currentDate,
  activities,
  onDateChange,
  getActivitiesForDate,
  onInteraction,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>('month');
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventStart, setNewEventStart] = useState<Date | null>(null);
  const [newEventEnd, setNewEventEnd] = useState<Date | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const fetchActivities = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/calendar-activity?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      const activities: FetchedActivity[] = await response.json();

      const formattedEvents: CalendarEvent[] = activities.map(activity => ({
        id: activity.id,
        start: new Date(activity.scheduledDate),
        end: new Date(activity.scheduledDate),
        title: activity.activityTitle,
        activityText: activity.activityText,
        hours: activity.hours
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const parseDate = (date: stringOrDate): Date => {
    if (date instanceof Date) return date;
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }
    return parsed;
  };

  const onEventDrop = async ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
    if (start && end) {
      try {
        const updatedEvent: CalendarEvent = { 
          ...event, 
          start: parseDate(start), 
          end: parseDate(end)
        };
        setEvents(currentEvents =>
          currentEvents.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev)
        );
        await updateEventInBackend(updatedEvent);
        onInteraction();
      } catch (error) {
        console.error("Error updating event:", error);
        // You might want to add some user feedback here
      }
    }
  };

  const onEventResize = async ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
    if (start && end) {
      try {
        const updatedEvent: CalendarEvent = { 
          ...event, 
          start: parseDate(start), 
          end: parseDate(end)
        };
        setEvents(currentEvents =>
          currentEvents.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev)
        );
        await updateEventInBackend(updatedEvent);
        onInteraction();
      } catch (error) {
        console.error("Error updating event:", error);
        // You might want to add some user feedback here
      }
    }
  };

  const updateEventInBackend = async (event: CalendarEvent) => {
    try {
      const response = await fetch(`/api/calendar-activity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          scheduledDate: event.start.toISOString(),
          activityTitle: event.title,
          activityText: event.activityText,
          hours: event.hours
        })
      });
  
      if (!response.ok) throw new Error('Failed to update activity');
      
      return await response.json(); // Return the updated event data
    } catch (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
  };

  const handleSelect = ({ start, end }: { start: Date; end: Date }) => {
    setNewEventStart(start);
    setNewEventEnd(end);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewEventStart(null);
    setNewEventEnd(null);
  };

  const handleModalSubmit = async (title: string) => {
    if (title && user?.id && newEventStart && newEventEnd) {
      const newEvent: Omit<CalendarEvent, 'id'> = {
        start: newEventStart,
        end: newEventEnd,
        title,
        activityText: '',
        hours: 1
      };

      try {
        const response = await fetch('/api/calendar-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newEvent,
            userId: user.id,
            scheduledDate: newEventStart.toISOString()
          })
        });

        if (!response.ok) throw new Error('Failed to create activity');

        const createdActivity: { id: string } = await response.json();
        setEvents(prevEvents => [...prevEvents, { ...newEvent, id: createdActivity.id }]);
        onInteraction();
        handleModalClose();
      } catch (error) {
        console.error("Error creating activity:", error);
        // You might want to add some user feedback here
      }
    }
  };

  const onView = (newView: View) => {
    setView(newView);
  };

  const eventStyleGetter = () => {
    const style = {
      backgroundColor: '#3174ad',
      borderRadius: '0px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return { style };
  };

  return (
    <div className="custom-calendar" style={{ height: '100%' }}>
      <DnDCalendar
        className="custom-calendar"
        defaultDate={moment().toDate()}
        view={view}
        onView={onView}
        events={events}
        localizer={localizer}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        resizable
        selectable
        onSelectSlot={handleSelect}
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
      />
      <AddEventModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default InteractiveCalendar;
