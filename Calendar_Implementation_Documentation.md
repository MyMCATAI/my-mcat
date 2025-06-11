# Calendar Implementation Documentation

## Overview

The calendar system in the PracticeTests component is a sophisticated implementation that combines exam scheduling, study activities, and calendar visualization. It uses React Big Calendar as the core calendar library with extensive customization and integration with the application's activity management system.

## Core Components

### 1. TestCalendar (`components/calendar/TestCalendar.tsx`)

**Primary Calendar Component** - The main calendar visualization that displays both exam activities and study activities.

#### Key Features:
- **React Big Calendar Integration**: Uses `react-big-calendar` with date-fns localization
- **Event Type Differentiation**: Handles both exam events and study events with different styling
- **Interactive Toolbar**: Custom toolbar with navigation and action buttons
- **Event Styling**: Dynamic styling based on event type and completion status
- **Modal Integration**: Connects to WeeklyCalendarModal and ReplaceEventModal

#### Props Interface:
```typescript
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
  buttonLabels?: {
    generate?: string;
    summarize?: string;
    hideSummarize?: boolean;
  };
}
```

#### Event Processing:
- **Event Styling**: Different colors and styles for exam vs study events
- **Completion Status**: Visual indicators for completed activities
- **MCAT Exam Special Handling**: Special styling for actual MCAT exam events
- **Event Interaction**: Click handlers for different event types

### 2. WeeklyCalendarModal (`components/calendar/WeeklyCalendarModal.tsx`)

**Schedule Generation Modal** - A multi-step modal for setting up weekly study schedules.

#### Key Features:
- **Multi-Step Wizard**: 4-step process for schedule creation
- **Dynamic Schedule Planning**: Calculates all days until next exam
- **Resource Selection**: Choose from multiple study resources
- **Study Balance Configuration**: Set content vs practice ratios
- **Hours Management**: Individual day hour setting with bulk actions

#### Step Flow:
1. **Next Steps**: Review upcoming exams and change dates
2. **Weekly Schedule**: Set study hours for each day
3. **Resources**: Select study materials and platforms
4. **Study Balance**: Choose content/practice ratio
5. **Generation**: Create the schedule with loading states

#### Schedule Management:
```typescript
// Hours per day tracking
const [weeklyHours, setWeeklyHours] = useState<Record<string, string>>({});

// Resource selection
const [resources, setResources] = useState<Resource[]>([
  { id: 'adaptive', name: 'MyMCAT Adaptive Tutoring', selected: true },
  { id: 'ankigame', name: 'MyMCAT Anki Clinic', selected: false },
  // ... other resources
]);

// Study balance options
const balanceOptions: StudyBalance[] = [
  { id: '75-25', ratio: 'More Content', description: '75% Content, 25% Practice' },
  { id: '50-50', ratio: 'Balanced', description: '50% Content, 50% Practice' },
  { id: '25-75', ratio: 'More Practice', description: '25% Content, 75% Practice' }
];
```

### 3. CalendarView (`app/(dashboard)/(routes)/ankiclinic/onboarding/CalendarView.tsx`)

**Onboarding Calendar Display** - A sample calendar view used during the onboarding process.

#### Key Features:
- **Sample Events**: Pre-defined MCAT prep schedule from May-June 2024
- **Comprehensive Coverage**: Shows tutoring, group classes, practice tests, and free sessions
- **Event Categorization**: Different event types (tutoring, exam, class, content, free)

#### Sample Event Structure:
```typescript
const SAMPLE_CALENDAR_EVENTS = [
  {
    id: '1',
    title: 'FREE Diagnostic Assessment',
    start: new Date(2024, 4, 6, 10, 0),
    end: new Date(2024, 4, 6, 13, 0),
    resource: {
      activityTitle: 'FREE Diagnostic Assessment',
      activityText: 'Complete MCAT diagnostic test',
      hours: 3,
      eventType: 'free',
      status: 'Scheduled'
    }
  },
  // ... more events
];
```

### 4. SettingContent (`components/calendar/SettingContent.tsx`)

**Calendar Setup Component** - Used for initial exam date and schedule configuration.

#### Key Features:
- **Multi-Step Setup**: Exam date selection, study hours configuration
- **Test Date Options**: Pre-defined test dates throughout the year
- **Hours Per Day Configuration**: Individual day hour settings
- **Full Length Exam Days**: Special designation for practice test days

## Data Flow and State Management

### Calendar Events Creation (PracticeTests.tsx)

The calendar events are created by combining exam activities and study activities:

```typescript
useEffect(() => {
  if (examActivities && allActivities) {
    // Process exam events
    const examEvents = examActivities.map((activity) => {
      // Map exam titles to shorter display names
      let displayTitle = "EXAM";
      if (activity.activityTitle === "MCAT Exam") {
        displayTitle = "MCAT";
      } else if (activity.activityTitle.includes("Unscored Sample")) {
        displayTitle = "Unscored";
      } else if (activity.activityTitle.includes("Full Length Exam")) {
        const number = activity.activityTitle.match(/\d+/)?.[0];
        displayTitle = `FL${number}`;
      } else if (activity.activityTitle.includes("Sample Scored")) {
        displayTitle = "Scored";
      }

      return {
        id: activity.id,
        title: displayTitle,
        start: new Date(activity.scheduledDate),
        end: new Date(activity.scheduledDate),
        allDay: true,
        activityText: activity.activityText,
        hours: activity.hours,
        activityType: activity.activityType,
        resource: { 
          ...activity, 
          eventType: 'exam' as const,
          fullTitle: activity.activityTitle,
          // ... other properties
        }
      };
    });

    // Process study events
    const studyEvents = allActivities
      .filter(activity => activity.activityType !== 'exam')
      .map((activity) => ({
        id: activity.id,
        title: activity.activityTitle,
        start: new Date(activity.scheduledDate),
        end: new Date(activity.scheduledDate),
        allDay: true,
        // ... other properties
        resource: { 
          ...activity, 
          eventType: 'study' as const,
          // ... other properties
        }
      }));

    setCalendarEvents([...examEvents, ...studyEvents]);
  }
}, [examActivities, allActivities]);
```

### Event Interaction Handlers

```typescript
// Handle calendar event selection
const handleSelectEvent = (event: ImportedCalendarEvent) => {
  const activity = event.resource;
  if (activity.eventType === 'exam') {
    // Handle exam selection
  } else {
    // Handle study activity selection
  }
};

// Handle date updates
const handleDateSelect = async (date: Date) => {
  if (selectedTestId) {
    try {
      const utcDate = toUTCDate(date);
      await updateExamDate(selectedTestId, utcDate);
      // Refresh activities
      if (onActivitiesUpdate) {
        await onActivitiesUpdate();
      }
    } catch (error) {
      console.error('Failed to update test date:', error);
    }
  }
};
```

## Integration with Hooks

### Calendar Activities Hook Integration

The calendar system integrates with several custom hooks:

```typescript
const { 
  activities: examActivities, 
  loading: examLoading, 
  updateExamDate, 
  createExamActivity, 
  fetchExamActivities 
} = useExamActivities();

const { 
  activities: allActivities, 
  loading: activitiesLoading, 
  refetch: refetchAllActivities 
} = useAllCalendarActivities();

const { loading: studyLoading } = useStudyActivities();
```

### Study Plan Integration

The WeeklyCalendarModal integrates with the study plan generation:

```typescript
const { generateTasks, loading: studyPlanLoading } = useStudyPlan();

const handleScheduleComplete = async () => {
  const response = await generateTasks({
    resources: {
      uworld: resources.find(r => r.id === 'uworld')?.selected || false,
      aamc: resources.find(r => r.id === 'aamc')?.selected || false,
      // ... other resources
    },
    hoursPerDay: weeklyHours,
    selectedBalance,
    startDate,
    endDate,
    examDate: new Date(nextExam.scheduledDate)
  });
};
```

## Modal System

### WeeklyCalendarModal Trigger

The modal is triggered when tests are completed:

```typescript
// Check for newly completed tests
useEffect(() => {
  if (examActivities) {
    const completedTests = examActivities
      .filter(activity => activity.status === "Completed" && activity.fullLengthExam)
      .map(activity => {
        // Process completed test data
      });

    // Track completion and show modal for recent completions
    const newlyCompletedTests = completedTests.filter(test => {
      const existingRecord = completedTestRecords.find(r => r.id === test.id);
      return !existingRecord;
    });

    if (newlyCompletedTests.length > 0) {
      setShowWeeklyModal(true);
    }
  }
}, [examActivities, completedTestRecords]);
```

### Modal Completion Handler

```typescript
const handleWeeklyModalComplete = async ({ success, action }: { 
  success: boolean; 
  action?: 'generate' | 'save' | 'reset' 
}) => {
  if (success) {
    try {
      // Refresh all activities
      await Promise.all([
        fetchExamActivities(),
        refetchAllActivities()
      ]);
      
      // Update parent's activities state
      if (onActivitiesUpdate) {
        await onActivitiesUpdate();
      }
      
      if (action === 'generate') {
        handleSetTab && handleSetTab('Tests');
      }
      return true;
    } catch (error) {
      console.error('Failed to refresh activities:', error);
      return false;
    }
  }
  return false;
};
```

## Styling and Customization

### Calendar Styling

The calendar uses custom CSS classes defined in `@/components/styles/CustomCalendar.css`:

```typescript
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
```

### Theme Integration

The calendar components use CSS custom properties for theming:

- `--theme-mainbox-color`: Main background color
- `--theme-text-color`: Primary text color
- `--theme-emphasis-color`: Accent color for highlights
- `--theme-hover-color`: Hover state colors
- `--theme-border-color`: Border colors
- `--theme-leaguecard-color`: Card background colors

## Helper Components

### DatePickerDialog
- Provides date selection interface
- Integrates with exam rescheduling
- Validation for past dates

### ReplaceEventModal
- Allows replacing study events
- API integration for event updates
- Form validation and error handling

### ResetConfirmDialog
- Confirmation dialog for schedule resets
- State cleanup on confirmation
- Integration with schedule regeneration

## Data Types and Interfaces

### CalendarEvent Interface

```typescript
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
```

### CalendarEventResource Interface

```typescript
interface CalendarEventResource {
  eventType: 'exam' | 'study';
  fullTitle: string;
  activityText: string;
  hours: number;
  activityType: string;
  activityTitle: string;
  status: string;
  fullLengthExam?: {
    id: string;
    dataPulses: Array<{
      name: string;
      positive: number;
      level: string;
      reviewed?: boolean;
    }>;
    aiResponse?: string;
  };
}
```

## Performance Considerations

### Memoization and Optimization

- Events are memoized based on activities data
- Calendar re-renders are optimized through proper dependency arrays
- Modal state management prevents unnecessary re-renders

### Data Fetching

- Activities are fetched in parallel when possible
- Refreshing activities is done strategically after updates
- Loading states prevent user interaction during data operations

## Error Handling

### API Error Management

```typescript
try {
  await updateExamDate(selectedTestId, utcDate);
  // Success handling
} catch (error) {
  console.error('Failed to update test date:', error);
  toast.error('Failed to update exam date. Please try again.');
}
```

### User Feedback

- Toast notifications for success/error states
- Loading indicators during async operations
- Validation messages for form inputs
- Confirmation dialogs for destructive actions

## Integration Points

### Parent Component Communication

The calendar system communicates with its parent through:

- `onActivitiesUpdate()`: Triggers parent to refresh activity data
- `handleSetTab()`: Navigation between different app sections
- `chatbotRef`: Integration with chatbot functionality

### Database Synchronization

- Real-time updates to exam schedules
- Study plan generation and storage
- Activity completion tracking
- User preference persistence

This calendar implementation provides a comprehensive solution for MCAT study scheduling, combining visual calendar display, interactive scheduling tools, and sophisticated state management to create a seamless user experience for exam preparation planning. 