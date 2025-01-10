import React from 'react';
import { Calendar, dateFnsLocalizer, ToolbarProps, View } from 'react-big-calendar';
import { format, isToday, isTomorrow } from 'date-fns';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/components/styles/CustomCalendar.css";

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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
}

interface TestCalendarProps {
  events: CalendarEvent[];
  date: Date;
  onNavigate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  chatbotRef?: React.MutableRefObject<{
    sendMessage: (message: string) => void;
  }>;
}

interface ToolbarWithEventsProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT') => void;
  events: CalendarEvent[];
  chatbotRef?: React.MutableRefObject<{
    sendMessage: (message: string) => void;
  }>;
  onSummarize: () => void;
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
  onSummarize
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
        <div className="flex-1 flex justify-center">
          <button
            onClick={onSummarize}
            className="bg-[--theme-hover-color] text-[--theme-hover-text] hover:opacity-90 transition-all duration-200 px-4 py-1.5 rounded-lg text-sm"
          >
            Summarize My Week
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
  chatbotRef 
}) => {
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
      }).join("\n\n")}
    `.trim();

    return {
      contentTitle: "Personal Calendar",
      context: context
    };
  };

  // Modify the CustomToolbarWithEvents to use the new context
  const handleSummarizeWeek = () => {
    const contextData = createCalendarContext();
    if (chatbotRef?.current) {
      chatbotRef.current.sendMessage("Please summarize my test schedule for this week");
    }
  };

  // Custom event styling based on event type
  const eventStyleGetter = (event: CalendarEvent) => {
    const isExam = event.resource?.eventType === 'exam';
    const isMCATExam = event.title === 'MCAT Exam';
    
    return {
      className: `calendar-event ${isMCATExam ? 'mcat-exam-event' : isExam ? 'exam-event' : 'study-event'}`,
      style: {
        backgroundColor: isExam ? 'var(--theme-emphasis-color)' : 'var(--theme-hover-color)',
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
      />
    ),
    eventContent: (event: any) => (
      <div title={event.event.resource.fullTitle}>
        {event.title}
      </div>
    )
  };

  return (
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
      onSelectEvent={onSelectEvent}
      eventPropGetter={eventStyleGetter}
      components={components}
    />
  );
};

export default TestCalendar; 