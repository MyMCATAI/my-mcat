"use client";

// TODO:  Event creation - show in frontend, post new calendar event in backend

import React, { useState, useEffect } from "react";
import {
  momentLocalizer,
  View,
  stringOrDate,
  NavigateAction,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/components/styles/AgendaCalendar.css";
import { addDays, format, isTomorrow, isSameDay } from 'date-fns';
import { Plus, Coffee } from 'lucide-react';

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
  tasks?: any[];
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
  tasks?: any[];
}

const localizer = momentLocalizer(moment);

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
  tasks?: any[];
}

interface InteractiveCalendarProps {
  currentDate: Date;
  activities: FetchedActivity[];
  onDateChange: (date: Date) => void;
  getActivitiesForDate: (date: Date) => FetchedActivity[];
  onInteraction: () => void;
  setRunTutorialPart2: (value: boolean) => void;
  setRunTutorialPart3: (value: boolean) => void;
  handleSetTab: (tab: string) => void;
  onTasksUpdate: (eventId: string, tasks: any[]) => void;
  updateTodaySchedule: () => void;
}

// Add this conversion function
const convertToCalendarEvent = (activity: any): CalendarEvent => {
  return {
    id: activity.id,
    start: new Date(activity.scheduledDate),
    end: new Date(activity.scheduledDate),
    title: activity.activityTitle,
    activityText: activity.activityText,
    hours: activity.hours,
    activityType: activity.activityType,
    link: activity.link,
    tasks: activity.tasks || [],
  };
};

interface DayCardProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: (date: Date) => void;
}

const DayCard: React.FC<DayCardProps> = ({ date, events, onEventClick, onAddEvent }) => {
  const totalHours = events.reduce((sum, event) => sum + event.hours, 0);
  
  const handleAddBreak = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a break event with default values
    const breakEvent: CalendarActivityData = {
      activityTitle: "Break",
      activityText: "Taking a break",
      hours: 0.5,
      activityType: "Break",
      scheduledDate: date.toISOString()
    };
  };
  
  return (
    <div className="day-card">
      <div className="day-header">
        <div className="flex items-center gap-3">
          {isTomorrow(date) ? 'Tomorrow' : format(date, 'EEE, MMM d')}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddEvent(date);
            }}
            className="p-1 rounded-full hover:bg-[--theme-hover-color] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={handleAddBreak}
            className="p-1 rounded-full hover:bg-[--theme-hover-color] transition-colors"
            title="Add break"
          >
            <Coffee className="w-4 h-4" />
          </button>
        </div>
        <span className="total-hours">{totalHours} hours total</span>
      </div>
      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-item" onClick={() => onEventClick(event)}>
            <h4>{event.title}</h4>
            <p>{event.hours} hours - {event.activityType}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  currentDate,
  activities,
  onDateChange,
  getActivitiesForDate,
  onInteraction,
  setRunTutorialPart2,
  setRunTutorialPart3,
  handleSetTab,
  onTasksUpdate,
  updateTodaySchedule,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>("week");
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventStart, setNewEventStart] = useState<Date | null>(null);
  const [newEventEnd, setNewEventEnd] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [date, setDate] = useState(currentDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const next7Days = Array.from({length: 14}, (_, i) => addDays(new Date(), i + 1));

  useEffect(() => {
    fetchActivities();
  }, [user, activities]);

  // useEffect(() => {
  //   const tutorialPart3Played = localStorage.getItem("tutorialPart3Played");
  //   const tutorialPart2Played = localStorage.getItem("tutorialPart2Played");

  //   if (tutorialPart2Played === "true" && (!tutorialPart3Played || tutorialPart3Played === "false")) {
  //     const timer = setTimeout(() => {
  //       setRunTutorialPart3(true);
  //       localStorage.setItem("tutorialPart3Played", "true");
  //     }, 8000); // 8 seconds after Part 2

  //     return () => clearTimeout(timer);
  //   }
  // }, [setRunTutorialPart3]);

  const fetchActivities = async () => {
    if (!user?.id) return;

    try {
      const formattedEvents: CalendarEvent[] = activities.map((activity) => ({
        id: activity.id,
        start: new Date(activity.scheduledDate),
        end: new Date(activity.scheduledDate),
        title: activity.activityTitle,
        activityText: activity.activityText,
        hours: activity.hours,
        activityType: activity.activityType,
        link: activity.link,
        tasks: activity.tasks,
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
        // Fetch default tasks only for new events
        let tasks = [];
        try {
          const defaultTasks = await fetch(
            `/api/event-task?eventTitle=${eventData.activityTitle}`
          ).then((res) => res.json());
          tasks = defaultTasks;
        } catch (error) {
          console.error("Error fetching default tasks:", error);
          tasks = [];
        }

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
            tasks: tasks, // Include the default tasks
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setErrorMessage(errorData.error || "Failed to create activity");
          throw new Error(errorData.error || "Failed to create activity");
        }

        const createdActivity: CalendarActivityData & { id: string } =
          await response.json();
        const calendarEvent = convertToCalendarEvent(createdActivity);
        setEvents((prevEvents) => [...prevEvents, calendarEvent]);

        // Update today's schedule if the new event is for today
        const today = new Date();
        const eventDate = new Date(createdActivity.scheduledDate);
        if (
          isSameDay(today, eventDate) &&
          onTasksUpdate &&
          updateTodaySchedule
        ) {
          onTasksUpdate(createdActivity.id, tasks);
          updateTodaySchedule();
        }

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
      const start = moment(date).startOf("month").toDate();
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

  // const handleCalendarClick = () => {
  //   const tutorialPart3Played = localStorage.getItem("tutorialPart3Played");
  //   if (!tutorialPart3Played || tutorialPart3Played === "false") {
  //     setTimeout(() => {
  //       setRunTutorialPart3(true);
  //       localStorage.setItem("tutorialPart3Played", "true");
  //     }, 10000);
  //   }
  // };

  const handleEventSubmit = (eventData: CalendarActivityData) => {
    // Call handleModalSubmit with the entire eventData object
    handleModalSubmit(eventData);

    // You can still log the full event data if needed
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
        const response = await fetch(
          `/api/calendar-activity?id=${eventToDelete}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete event");
        }

        setEvents((currentEvents) =>
          currentEvents.filter((ev) => ev.id !== eventToDelete)
        );
        const deletedEvent = events.find((ev) => ev.id === eventToDelete);
        if (deletedEvent && isSameDay(new Date(), deletedEvent.start)) {
          updateTodaySchedule();
        }

        onInteraction();
        handleEditModalClose();
      } catch (error) {
        console.error("Error deleting event:", error);
        setErrorMessage("Failed to delete event");
      }
    }
    setShowDeleteConfirm(false);
    setEventToDelete(null);
  };

  const handleEditModalSubmit = async (
    updatedEventData: CalendarActivityData
  ) => {
    if (selectedEvent) {
      try {
        // Create payload with existing tasks if not provided in update
        const payload = {
          ...updatedEventData,
          id: selectedEvent.id,
          scheduledDate: selectedEvent.start.toISOString(),
          tasks: updatedEventData.tasks || selectedEvent.tasks,
        };

        const response = await fetch(`/api/calendar-activity`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to update event");
        }

        const updatedEventFromServer = await response.json();

        // Update the events state with the new data
        setEvents((currentEvents) =>
          currentEvents.map((ev) =>
            ev.id === selectedEvent.id
              ? {
                  ...ev,
                  title: updatedEventFromServer.activityTitle,
                  activityText: updatedEventFromServer.activityText,
                  hours: updatedEventFromServer.hours,
                  activityType: updatedEventFromServer.activityType,
                  link: updatedEventFromServer.link,
                  tasks: updatedEventFromServer.tasks,
                  start: new Date(updatedEventFromServer.scheduledDate),
                  end: new Date(updatedEventFromServer.scheduledDate),
                }
              : ev
          )
        );

        const today = new Date();
        const eventDate = new Date(updatedEventFromServer.scheduledDate);
        if (isSameDay(today, eventDate) && updateTodaySchedule) {
          updateTodaySchedule();
        }

        onInteraction();
        handleEditModalClose();
      } catch (error) {
        console.error("Error updating event:", error);
        setErrorMessage("Failed to update event");
      }
    }
  };

  const handleNavigate = (
    newDate: Date,
    view: View,
    action: NavigateAction
  ) => {
    if (view === "agenda") {
      const start = moment(newDate).startOf("month").toDate();
      setDate(start);
      onDateChange(start);
    } else {
      setDate(newDate);
      onDateChange(newDate);
    }
  };

  // Test whether study plan removes future activities
  // const HARDCODED_TODAY = new Date('2024-10-30');
  // HARDCODED_TODAY.setHours(0, 0, 0, 0);

  // Set initial date to tomorrow
  useEffect(() => {
    const tomorrow = addDays(new Date(), 1);
    setDate(tomorrow);
    onDateChange(tomorrow);
  }, [onDateChange]);

  const handleAddEvent = (date: Date) => {
    setNewEventStart(date);
    setNewEventEnd(date);
    setIsModalOpen(true);
  };

  return (
    <div className="custom-calendar schedule-content">
      <div className="bg-[--theme-leaguecard-color] rounded-lg p-3 ml-4 mb-2 mr-4 shadow-sm">
        <div className="flex justify-center items-center">
          <div className="text-sm tracking-wide">
            {events.some(event => event.activityType === 'Exam' && event.start > new Date()) ? (
              <>
                Next Exam in
                <span className="text-[--theme-emphasis-color] text-sm font-semibold ml-1">
                  {(() => {
                    const nextExam = events
                      .filter(event => event.activityType === 'Exam' && event.start > new Date())
                      .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
                    const daysLeft = Math.ceil((nextExam.start.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return `${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
                  })()}
                </span>
              </>
            ) : (
              'No upcoming full-length exams scheduled'
            )}
          </div>
        </div>
      </div>
      <div className="days-container">
        {next7Days.map((date) => {
          const dayEvents = events.filter(event => 
            isSameDay(new Date(event.start), date)
          );
          return (
            <DayCard 
              key={date.toISOString()} 
              date={date} 
              events={dayEvents}
              onEventClick={handleEventClick}
              onAddEvent={handleAddEvent}
            />
          );
        })}
      </div>
      
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
        handleSetTab={handleSetTab}
        onTasksUpdate={onTasksUpdate}
      />
      <ErrorModal
        isOpen={errorMessage !== null}
        message={errorMessage || ""}
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