export interface Task {
  text: string;
  completed: boolean;
}

export interface CalendarEventResource {
  activityText: string;
  hours: number;
  activityType?: string;
  eventType: 'exam' | 'study';
  fullTitle: string;
  activityTitle: string;
  status: string;
  fullLengthExam?: {
    dataPulses?: Array<{
      level: string;
      reviewed: boolean;
    }>;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  activityText: string;
  hours: number;
  activityType?: string;
  resource: CalendarEventResource;
}

export interface ReplacementData {
  taskType: string;
  replacementScope: 'single' | 'future';
} 