import type { CalendarEvent } from "@/types/calendar";
import { FetchedActivity, normalizeActivity } from "@/hooks/useCalendarActivities";

/**
 * Processes exam activities into calendar events with proper formatting
 */
export function processExamActivities(examActivities: FetchedActivity[] = []): CalendarEvent[] {
  if (!examActivities?.length) return [];
  
  return examActivities.map((activity) => {
    // Ensure activity has all required fields
    const normalizedActivity = normalizeActivity(activity);
    
    // Map exam titles to shorter display names
    let displayTitle = "EXAM";
    if (normalizedActivity.activityTitle === "MCAT Exam") {
      displayTitle = "MCAT";
    } else if (normalizedActivity.activityTitle.includes("Unscored Sample")) {
      displayTitle = "Unscored";
    } else if (normalizedActivity.activityTitle.includes("Full Length Exam")) {
      const number = normalizedActivity.activityTitle.match(/\d+/)?.[0];
      displayTitle = `FL${number}`;
    } else if (normalizedActivity.activityTitle.includes("Sample Scored")) {
      displayTitle = "Scored";
    }

    return {
      id: normalizedActivity.id,
      title: displayTitle,
      start: new Date(normalizedActivity.scheduledDate),
      end: new Date(normalizedActivity.scheduledDate),
      allDay: true,
      activityText: normalizedActivity.activityText,
      hours: normalizedActivity.hours,
      activityType: normalizedActivity.activityType,
      resource: { 
        ...normalizedActivity, 
        eventType: 'exam' as const,
        fullTitle: normalizedActivity.activityTitle,
        activityText: normalizedActivity.activityText,
        hours: normalizedActivity.hours,
        activityType: normalizedActivity.activityType,
        activityTitle: normalizedActivity.activityTitle,
        status: normalizedActivity.status
      }
    };
  });
}

/**
 * Processes study activities into calendar events
 */
export function processStudyActivities(studyActivities: FetchedActivity[] = []): CalendarEvent[] {
  if (!studyActivities?.length) return [];
  
  return studyActivities.map((activity) => {
    // Ensure activity has all required fields
    const normalizedActivity = normalizeActivity(activity);
    
    return {
      id: normalizedActivity.id,
      title: normalizedActivity.activityTitle,
      start: new Date(normalizedActivity.scheduledDate),
      end: new Date(normalizedActivity.scheduledDate),
      allDay: true,
      activityText: normalizedActivity.activityText,
      hours: normalizedActivity.hours,
      activityType: normalizedActivity.activityType,
      resource: { 
        ...normalizedActivity, 
        eventType: 'study' as const,
        fullTitle: `${normalizedActivity.activityTitle} (${normalizedActivity.hours}h)`,
        activityText: normalizedActivity.activityText,
        hours: normalizedActivity.hours,
        activityType: normalizedActivity.activityType,
        activityTitle: normalizedActivity.activityTitle,
        status: normalizedActivity.status
      }
    };
  });
}

/**
 * Combines all calendar events and returns a sorted array
 */
export function combineCalendarEvents(
  examEvents: CalendarEvent[] = [], 
  studyEvents: CalendarEvent[] = []
): CalendarEvent[] {
  // Combine events
  const combined = [...examEvents, ...studyEvents];
  
  // Sort by date (earliest first)
  return combined.sort((a, b) => {
    return a.start.getTime() - b.start.getTime();
  });
}

/**
 * Finds today's activities from a list of calendar events
 */
export function getTodaysActivities(calendarEvents: CalendarEvent[] = []): CalendarEvent[] {
  if (!calendarEvents?.length) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return calendarEvents.filter(event => {
    const eventDate = new Date(event.start);
    eventDate.setHours(0, 0, 0, 0);
    
    return eventDate.getTime() === today.getTime();
  });
}

/**
 * Finds upcoming exams from a list of calendar events
 */
export function getUpcomingExams(calendarEvents: CalendarEvent[] = [], limit: number = 3): CalendarEvent[] {
  if (!calendarEvents?.length) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter for future exam events
  const upcomingExams = calendarEvents
    .filter(event => {
      const eventDate = new Date(event.start);
      eventDate.setHours(0, 0, 0, 0);
      
      return eventDate.getTime() >= today.getTime() && 
             event.resource?.eventType === 'exam';
    })
    // Sort by date (earliest first)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
    
  // Return limited number if specified
  return limit > 0 ? upcomingExams.slice(0, limit) : upcomingExams;
} 