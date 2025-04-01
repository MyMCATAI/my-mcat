## Task: New User Onboarding Task List & Welcome Message
Status: Planning
Priority: High

### Requirements
- Create a deterministic, context-aware welcome message system (not AI-generated)
- Display persistent, interactive task list that guides new users
- Enable rich interactive components within chat messages
- Provide contextual navigation throughout the platform

### Welcome Message Strategy
1. **Time & Date Context:**
   ```typescript
   import { format } from 'date-fns';
   import { utcToZonedTime } from 'date-fns-tz';
   
   const getTimeContext = (userTimezone: string) => {
     const now = utcToZonedTime(new Date(), userTimezone);
     const hour = now.getHours();
     const timeOfDay = 
       hour < 12 ? 'morning' :
       hour < 17 ? 'afternoon' :
       hour < 22 ? 'evening' : 'night';
     
     return {
       greeting: `Good ${timeOfDay}`,
       date: format(now, 'EEEE, MMMM do'),
       isWeekend: [0, 6].includes(now.getDay()),
       isLateNight: hour >= 22 || hour <= 5
     };
   };
   ```

2. **User Progress-Based Messages:**
   ```typescript
   type WelcomeContext = {
     hasStudyPlan: boolean;
     hasPatientRecord: boolean;
     todaysTasks?: Activity[];
     tomorrowsTasks?: Activity[];
     streakDays: number;
     lastActive?: Date;
     // ... other context
   };

   const getWelcomeMessage = (context: WelcomeContext, timeContext: TimeContext) => {
     const messages = [];
     
     // Base greeting
     messages.push(`${timeContext.greeting} ${context.userInfo.firstName}!`);
     
     // Special time-based messages
     if (timeContext.isLateNight) {
       messages.push("Burning the midnight oil! Your dedication is impressive. Remember to get some rest too!");
     }
     if (timeContext.isWeekend && timeContext.hour > 9) {
       messages.push("Weekend warrior! Love the commitment to your goals.");
     }
     
     // Progress-based content
     if (!context.hasStudyPlan) {
       messages.push({
         text: "Let's start by creating your personalized study plan.",
         action: {
           type: "BUTTON",
           label: "Generate Study Plan",
           route: "/calendar"
         }
       });
     } else if (context.todaysTasks?.length) {
       messages.push({
         text: "Here's what's on your schedule today:",
         action: {
           type: "CALENDAR_PREVIEW",
           tasks: context.todaysTasks
         }
       });
     }
     
     // Streak celebration
     if (context.streakDays > 0) {
       messages.push(`🔥 ${context.streakDays} day streak! Keep it up!`);
     }
     
     return messages;
   };
   ```

3. **Interactive Components:**
   ```typescript
   interface ChatComponent {
     type: 'BUTTON' | 'CALENDAR_PREVIEW' | 'TASK_LIST' | 'PROGRESS_CHART';
     props: Record<string, any>;
   }

   interface ChatMessage {
     text: string;
     components?: ChatComponent[];
     actions?: {
       onClick?: () => void;
       route?: string;
     };
   }
   ```

### Task List Implementation
1. **Task Types & Status:**
   ```typescript
   interface Task {
     id: string;
     title: string;
     description: string;
     type: 'STUDY_PLAN' | 'ANKI' | 'CARS' | 'DISCORD';
     status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
     validation: {
       type: 'DATABASE' | 'ACTION' | 'API';
       check: string; // e.g., 'StudyPlan.exists' or 'PatientRecord.exists'
     };
     action: {
       type: 'ROUTE' | 'LINK' | 'FUNCTION';
       value: string;
     };
   }
   ```

2. **Progress Tracking:**
   ```typescript
   interface ProgressState {
     completedTasks: string[];
     lastActivity?: {
       type: string;
       timestamp: Date;
       progress?: number;
     };
     nextStep?: {
       task: Task;
       suggestion: string;
     };
   }
   ```

### Technical Implementation

1. **Welcome Message API (`/api/welcome-context`):**
   ```typescript
   interface WelcomeContextResponse {
     user: {
       timezone: string;
       firstName: string;
       onboardingInfo: OnboardingInfo;
     };
     progress: {
       studyPlan?: StudyPlan;
       patientRecord?: PatientRecord;
       recentTests?: UserTest[];
     };
     schedule: {
       today: Activity[];
       tomorrow: Activity[];
       nextMilestone?: Date;
     };
     stats: {
       streakDays: number;
       totalPatients: number;
       lastActive?: Date;
     };
   }
   ```

2. **Interactive Message Components:**
   - Create reusable chat components:
     ```typescript
     // components/chat/ActionButton.tsx
     // components/chat/CalendarPreview.tsx
     // components/chat/TaskProgress.tsx
     ```
   - Implement message renderer that can handle both text and components:
     ```typescript
     const MessageRenderer: React.FC<{message: ChatMessage}> = ({message}) => {
       return (
         <div className="flex flex-col gap-2">
           <div className="chat-text">{message.text}</div>
           {message.components?.map(component => (
             <ChatComponentRenderer key={component.id} {...component} />
           ))}
         </div>
       );
     };
     ```

### Notes
- Welcome message should be deterministic but feel personal
- Use date-fns-tz for consistent timezone handling
- Cache welcome context with short TTL (5-10 minutes)
- Consider A/B testing different message formats
- Track which message variants lead to better engagement
- Consider adding "quick action" buttons based on context:
  ```typescript
  const getQuickActions = (context: WelcomeContext) => {
    if (!context.hasStudyPlan) return ['CREATE_STUDY_PLAN'];
    if (context.todaysTasks?.length) return ['VIEW_SCHEDULE', 'START_NEXT_TASK'];
    return ['PRACTICE_CARS', 'VISIT_CLINIC'];
  };
  ```
- Add analytics tracking for message interactions
- Consider implementing "message of the day" for special dates/events
- Allow users to customize their preferred greeting style
- Add support for seasonal/holiday-specific messages
- Consider adding motivational quotes based on user's study phase