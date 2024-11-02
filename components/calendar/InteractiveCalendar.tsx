"use client";

// TODO:  Event creation - show in frontend, post new calendar event in backend

import React, { useState, useEffect } from "react";
import {
  Calendar,
  momentLocalizer,
  View,
  stringOrDate,
  NavigateAction,
} from "react-big-calendar";
import moment from "moment";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/CustomCalendar.css";

import { useUser } from "@clerk/nextjs";
import AddEventModal from "./AddEventModal";
import EditEventModal from "./EditEventModal";
import ErrorModal from "@/components/calendar/ErrorModal";
import ConfirmModal from "@/components/calendar/ConfirmModal";

// Assuming you have a types file with this interface
interface FetchedActivity {
  id: string;
  scheduledDate: string;
  activityTitle: string;
  activityText: string;
  hours: number;
  activityType: string;
  link?: string | null;
}

interface CalendarEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  activityText: string;
  hours: number;
  activityType: string;
  link?: string | null;
}

const localizer = momentLocalizer(moment);

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

interface CalendarActivityData {
  activityTitle: string;
  activityText: string;
  hours: number;
  activityType: string;
  link?: string | null;
  scheduledDate: string; // Change this to string to match the API
  categoryId?: string;
  status?: string;
  contentId?: string;
}

interface InteractiveCalendarProps {
  currentDate: Date;
  activities: FetchedActivity[];
  onDateChange: (date: Date) => void;
  getActivitiesForDate: (date: Date) => FetchedActivity[];
  onInteraction: () => void;
  setRunTutorialPart2: (value: boolean) => void;
  setRunTutorialPart3: (value: boolean) => void;
}

// Add this conversion function
const convertToCalendarEvent = (activity: CalendarActivityData & { id: string }): CalendarEvent => {
  return {
    id: activity.id,
    start: new Date(activity.scheduledDate),
    end: new Date(activity.scheduledDate),
    title: activity.activityTitle,
    activityText: activity.activityText,
    hours: activity.hours,
    activityType: activity.activityType,
    link: activity.link,
  };
};

const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  currentDate,
  activities,
  onDateChange,
  getActivitiesForDate,
  onInteraction,
  setRunTutorialPart2,
  setRunTutorialPart3,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>("month");
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventStart, setNewEventStart] = useState<Date | null>(null);
  const [newEventEnd, setNewEventEnd] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [date, setDate] = useState(currentDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [user]);

  useEffect(() => {
    const tutorialPart2Played = localStorage.getItem("tutorialPart2Played");
    if (!tutorialPart2Played || tutorialPart2Played === "false") {
      const timer = setTimeout(() => {
        setRunTutorialPart2(true);
        console.log("tutorialPart2Played:", tutorialPart2Played); // Debugging line
        localStorage.setItem("tutorialPart2Played", "true");
      }, 6000); // Changed from 20000 to 6000 milliseconds

      return () => clearTimeout(timer);
    }
  }, []);

  const fetchActivities = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/calendar-activity?userId=${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch activities");
      const activities: FetchedActivity[] = await response.json();

      const formattedEvents: CalendarEvent[] = activities.map((activity) => ({
        id: activity.id,
        start: new Date(activity.scheduledDate),
        end: new Date(activity.scheduledDate),
        title: activity.activityTitle,
        activityText: activity.activityText,
        hours: activity.hours,
        activityType: activity.activityType,
        link: activity.link,
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

  const onEventDrop = async ({
    event,
    start,
    end,
  }: EventInteractionArgs<CalendarEvent>) => {
    if (start && end) {
      try {
        const updatedEvent: CalendarEvent = {
          ...event,
          start: parseDate(start),
          end: parseDate(end),
        };
        setEvents((currentEvents) =>
          currentEvents.map((ev) =>
            ev.id === updatedEvent.id ? updatedEvent : ev
          )
        );
        await updateEventInBackend(updatedEvent);
        onInteraction();
      } catch (error) {
        console.error("Error updating event:", error);
        // You might want to add some user feedback here
      }
    }
  };

  const onEventResize = async ({
    event,
    start,
    end,
  }: EventInteractionArgs<CalendarEvent>) => {
    if (start && end) {
      try {
        const updatedEvent: CalendarEvent = {
          ...event,
          start: parseDate(start),
          end: parseDate(end),
        };
        setEvents((currentEvents) =>
          currentEvents.map((ev) =>
            ev.id === updatedEvent.id ? updatedEvent : ev
          )
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: event.id,
          scheduledDate: event.start.toISOString(),
          activityTitle: event.title,
          activityText: event.activityText,
          hours: event.hours,
          activityType: event.activityType,
          link: event.link,
        }),
      });

      if (!response.ok) throw new Error("Failed to update activity");

      return await response.json();
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

  const handleModalSubmit = async (eventData: CalendarActivityData) => {
    if (eventData.activityTitle && user?.id && newEventStart && newEventEnd) {
      try {
        const response = await fetch("/api/calendar-activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            activityTitle: eventData.activityTitle,
            activityText: eventData.activityText,
            hours: eventData.hours,
            activityType: eventData.activityType,
            link: eventData.link,
            scheduledDate: newEventStart.toISOString(),
            categoryId: eventData.categoryId,
            contentId: eventData.contentId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setErrorMessage(errorData.error || "Failed to create activity");
          throw new Error(errorData.error || "Failed to create activity");
        }

        const createdActivity: CalendarActivityData & { id: string } = await response.json();
        setEvents((prevEvents) => [...prevEvents, convertToCalendarEvent(createdActivity)]);
        onInteraction();
        handleModalClose();
      } catch (error) {
        console.error("Error creating activity:", error);
        setErrorMessage("Failed to create activity");
      }
    }
  };

  const onView = (newView: View) => {
    setView(newView);
    if (newView === "agenda") {
      // Get the first day of the current month
      const start = moment(date).startOf('month').toDate();
      setDate(start);
      onDateChange(start);
    }
  };

  // Calculate the number of days in the current month
  const daysInMonth = moment(date).daysInMonth();

  const eventStyleGetter = () => {
    const style = {
      backgroundColor: "#3174ad",
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      // display: "block",  // It will causes rowSpan malfunctions
    };
    return { style };
  };

  const handleCalendarClick = () => {
    const tutorialPart3Played = localStorage.getItem("tutorialPart3Played");
    if (!tutorialPart3Played || tutorialPart3Played === "false") {
      setTimeout(() => {
        setRunTutorialPart3(true);
        console.log("tutorialPart3Played:", tutorialPart3Played); // Debugging line
        localStorage.setItem("tutorialPart3Played", "true");
      }, 10000);
    }
  };

  const handleEventSubmit = (eventData: CalendarActivityData) => {
    // Call handleModalSubmit with the entire eventData object
    handleModalSubmit(eventData);
    
    // You can still log the full event data if needed
    console.log('Full event data:', eventData);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        const response = await fetch(`/api/calendar-activity?id=${eventToDelete}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete event');
        }

        setEvents((currentEvents) => currentEvents.filter((ev) => ev.id !== eventToDelete));
        onInteraction();
        handleEditModalClose();
      } catch (error) {
        console.error('Error deleting event:', error);
        setErrorMessage('Failed to delete event');
      }
    }
    setShowDeleteConfirm(false);
    setEventToDelete(null);
  };

  const handleEditModalSubmit = async (updatedEventData: CalendarActivityData) => {
    if (selectedEvent) {
      try {
        const updatedEvent: CalendarEvent = {
          ...selectedEvent,
          title: updatedEventData.activityTitle,
          activityText: updatedEventData.activityText,
          hours: updatedEventData.hours,
          activityType: updatedEventData.activityType,
          link: updatedEventData.link,
        };
        const updatedEventFromServer = await updateEventInBackend(updatedEvent);
        setEvents((currentEvents) =>
          currentEvents.map((ev) =>
            ev.id === updatedEventFromServer.id ? convertToCalendarEvent(updatedEventFromServer) : ev
          )
        );
        onInteraction();
        handleEditModalClose();
      } catch (error) {
        console.error("Error updating event:", error);
        // Add user feedback here, e.g., show an error message
      }
    }
  };

  const handleNavigate = (newDate: Date, view: View, action: NavigateAction) => {
    if (view === 'agenda') {
      const start = moment(newDate).startOf('month').toDate();
      setDate(start);
      onDateChange(start);
    } else {
      setDate(newDate);
      onDateChange(newDate);
    }
  };

  return (
    <div className="custom-calendar" style={{ height: "100%", position: "relative" }}>
      <DnDCalendar
        className="custom-calendar"
        date={date}
        onNavigate={handleNavigate}
        view={view}
        onView={onView}
        events={events}
        localizer={localizer}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        resizable
        selectable
        onSelectSlot={handleSelect}
        onSelectEvent={handleEventClick}
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
        length={daysInMonth}
        endAccessor={(event) => {
          const eventEnd = moment(event.end);
          const monthEnd = moment(date).endOf('month');
          return eventEnd.isAfter(monthEnd) ? monthEnd.toDate() : event.end;
        }}
      />
      <AddEventModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleEventSubmit}
        selectedDate={newEventStart}
      />
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSubmit={handleEditModalSubmit}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
      />
      <ErrorModal 
        isOpen={errorMessage !== null}
        message={errorMessage || ''}
        onClose={() => setErrorMessage(null)}
      />
      <ConfirmModal
        isOpen={showDeleteConfirm}
        message="Are you sure you want to delete this event?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setEventToDelete(null);
        }}
      />
    </div>
  );
};

export default InteractiveCalendar;
