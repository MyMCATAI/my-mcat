import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, ToolbarProps, View } from 'react-big-calendar';
import { format, isToday, isTomorrow } from 'date-fns';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/components/styles/CustomCalendar.css";
import WeeklyCalendarModal from '@/components/calendar/WeeklyCalendarModal';
import ReplaceEventModal from '@/components/calendar/ReplaceEventModal';
import toast from 'react-hot-toast';
import { CalendarEvent, ReplacementData } from '@/types/calendar';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface TestCalendarProps {
  events: CalendarEvent[];
  date: Date;
  onNavigate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  chatbotRef?: React.MutableRefObject<{
    sendMessage: (message: string, messageContext?: string) => void;
  }>;
  handleSetTab?: (tab: string) => void;
  onEventUpdate?: () => void;
}

interface ToolbarWithEventsProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT') => void;
  events: CalendarEvent[];
  chatbotRef?: React.MutableRefObject<{
    sendMessage: (message: string) => void;
  }>;
  onSummarize: () => void;
  onGenerate: () => void;
}

const getNextTestDate = (events: CalendarEvent[]): Date | null => {
  const futureTests = events
    .map(event => event.start)
    .filter(date => date > new Date())
    .sort((a, b) => a.getTime() - b.getTime());
  
  return futureTests.length > 0 ? futureTests[0] : null;
};

// Base toolbar component that accepts only ToolbarProps
const BaseToolbar: React.FC<ToolbarProps<CalendarEvent, object>> = (props) => {
  const { onNavigate, label } = props;

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => onNavigate('PREV')}
        className="p-1.5 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] rounded-lg transition-all duration-200"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <span className="text-sm font-medium">{label}</span>
      <button 
        onClick={() => onNavigate('NEXT')}
        className="p-1.5 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] rounded-lg transition-all duration-200"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// Wrapper component that adds the countdown
const CustomToolbarWithEvents: React.FC<ToolbarWithEventsProps> = ({ 
  label, 
  onNavigate, 
  events,
  onSummarize,
  onGenerate
}) => {
  return (
    <div className="rbc-toolbar">
      <div className="header-content flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('PREV')}
            className="rbc-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="rbc-toolbar-label text-lg">{label}</span>
          <button
            onClick={() => onNavigate('NEXT')}
            className="rbc-btn"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 flex justify-center gap-4">
          <button
            onClick={onSummarize}
            className="bg-[--theme-hover-color] text-[--theme-hover-text] hover:opacity-90 transition-all duration-200 px-4 py-1.5 rounded-lg text-sm"
          >
            Summarize
          </button>
          <button
            onClick={onGenerate}
            className="bg-[--theme-hover-color] text-[--theme-hover-text] hover:opacity-90 transition-all duration-200 px-4 py-1.5 rounded-lg text-sm"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

const TestCalendar: React.FC<TestCalendarProps> = ({ 
  events, 
  date, 
  onNavigate, 
  onSelectEvent,
  chatbotRef,
  handleSetTab,
  onEventUpdate
}) => {
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const createCalendarContext = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Create array of next 7 days
    const nextWeekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    // Helper function to format events for a specific date
    const formatEventsForDate = (dateToCheck: Date) => {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.toDateString() === dateToCheck.toDateString();
      });

      return dayEvents.map(event => {
        const resource = event.resource;
        if (resource.eventType === 'exam') {
          // Format exam events with scores if available
          const scoreInfo = resource.fullLengthExam?.dataPulses?.reduce((acc: any, pulse: any) => {
            if (pulse.name.includes("Chemical")) acc.cp = pulse.positive;
            else if (pulse.name.includes("Critical")) acc.cars = pulse.positive;
            else if (pulse.name === "Biological and Biochemical Foundations") acc.bb = pulse.positive;
            else if (pulse.name === "Psychological, Social, and Biological Foundations") acc.ps = pulse.positive;
            return acc;
          }, { cp: 0, cars: 0, bb: 0, ps: 0 });

          const scoreText = resource.status === "Completed" && scoreInfo
            ? ` - Score: ${Object.values(scoreInfo as Record<string, number>).reduce((sum: number, score: number) => sum + score, 0)} (${scoreInfo.cp}/${scoreInfo.cars}/${scoreInfo.bb}/${scoreInfo.ps})`
            : '';

          return `Practice Exam: ${resource.activityTitle} (${resource.activityText}, ${resource.hours}h, ${resource.status}${scoreText})`;
        } else {
          // Format study events
          return `${resource.activityTitle} (${resource.eventType}, ${resource.hours}h, ${resource.status})`;
        }
      }).join("\n") || "No activities scheduled";
    };

    const context = `
      Here's my personal MCAT study calendar:

      Yesterday (${yesterday.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}):
      ${formatEventsForDate(yesterday)}

      ${nextWeekDays.map((date) => {
        const dayLabel = isToday(date)
          ? "Today"
          : date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

        return `${dayLabel}:\n${formatEventsForDate(date)}`;
      }).join("\n\n")}x
    `.trim();

    return {
      contentTitle: "Personal Calendar",
      context: context
    };
  };

  const handleSummarizeWeek = () => {
    const contextData = createCalendarContext();
    if (chatbotRef?.current) {
      const visibleMessage = "Summarize my week";
      const hiddenContext = `Here's my calendar context:\n\n${contextData.context}\n\nBased on this calendar, please provide a summary of my test schedule for this week. Include details about upcoming exams, their dates, and any completed exams.`;
      
      // Just switch the sidebar to Insights tab
      const sidebarInsightsTab = document.querySelector('[data-tab="tab1"]');
      if (sidebarInsightsTab instanceof HTMLElement) {
        sidebarInsightsTab.click();
      }
      
      // Add delay before sending message
      setTimeout(() => {
        chatbotRef.current.sendMessage(visibleMessage, hiddenContext);
      }, 2000);
    }
  };

  const handleGenerateSchedule = () => {
    setIsWeeklyModalOpen(true);
  };

  // Custom event styling based on event type
  const eventStyleGetter = (event: CalendarEvent) => {
    const isExam = event.resource?.eventType === 'exam';
    const isMCATExam = event.title === 'MCAT Exam';
    const isCompleted = event.resource?.fullLengthExam?.dataPulses?.some(p => p.level === "section" && p.reviewed) ?? false;
    
    return {
      className: `calendar-event ${
        isMCATExam ? 'mcat-exam-event' : 
        isExam ? 'exam-event' : 'study-event'
      } ${isCompleted ? 'completed-event' : ''}`,
      style: {
        backgroundColor: isExam ? 'var(--theme-emphasis-color)' : 'var(--theme-hover-color)',
        opacity: isCompleted ? '0.5' : '1'
      }
    };
  };

  // Add custom popup component for more details
  const components = {
    toolbar: (toolbarProps: any) => (
      <CustomToolbarWithEvents
        {...toolbarProps}
        events={events}
        chatbotRef={chatbotRef}
        onSummarize={handleSummarizeWeek}
        onGenerate={handleGenerateSchedule}
      />
    ),
    eventContent: (event: any) => (
      <div title={event.event.resource?.fullTitle || event.event.title}>
        {event.title}
      </div>
    )
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Don't allow replacing exam events
    if (event.resource?.eventType === 'exam') {
      onSelectEvent(event);
      return;
    }

    setSelectedEvent(event);
    setIsReplaceModalOpen(true);
  };

  const handleReplaceEvent = async (replacementData: ReplacementData) => {
    if (!selectedEvent) return;

    try {
      const response = await fetch('/api/calendar-activity/replace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          ...replacementData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to replace event');
      }

      toast.success('Event replaced successfully');
      
      // Trigger immediate refresh
      if (onEventUpdate) {
        await onEventUpdate();
      }
      
      setIsReplaceModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error replacing event:', error);
      toast.error('Failed to replace event');
    }
  };

  return (
    <>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        className="custom-calendar w-full max-w-full bg-transparent"
        views={['month']}
        defaultView="month"
        date={date}
        onNavigate={onNavigate}
        toolbar={true}
        popup
        selectable
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        components={components}
      />
      {isWeeklyModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsWeeklyModalOpen(false);
            }
          }}
        >
          <div className="w-[90vw] max-w-6xl max-h-[90vh] bg-[--theme-mainbox-color] rounded-xl overflow-hidden">
            <WeeklyCalendarModal
              onComplete={async (result: { success: boolean; action?: 'generate' | 'save' | 'reset' }) => {
                if (result.success) {
                  if (onEventUpdate) {
                    await onEventUpdate();
                  }
                  setIsWeeklyModalOpen(false);
                  return true;
                }
                return false;
              }}
              onClose={() => setIsWeeklyModalOpen(false)}
            />
          </div>
        </div>
      )}
      <ReplaceEventModal
        isOpen={isReplaceModalOpen}
        onClose={() => {
          setIsReplaceModalOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleReplaceEvent}
        event={selectedEvent}
      />
    </>
  );
};

export default TestCalendar; 