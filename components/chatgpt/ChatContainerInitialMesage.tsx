// components/chatgpt/ChatContainerInitialMesage.tsx
import type { CalendarActivity } from "@/hooks/useCalendarActivities";
import type { UserInfo } from "@/types/user";
import { isToday, isTomorrow, format, differenceInDays } from "date-fns";

interface GameState {
  streakDays: number;
  testScore: number;
  userLevel: string;
  totalPatients: number;
}

interface GenerateWelcomeMessageProps {
  userInfo: UserInfo | null;
  examActivities: CalendarActivity[];
  studyActivities: CalendarActivity[];
  gameState: GameState;
}

/**
 * Gets appropriate time-of-day greeting
 */
const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/**
 * Formats a date into a user-friendly string
 */
const formatDateNicely = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return "today";
  } 
  if (isTomorrow(date)) {
    return "tomorrow";
  }
  
  return format(date, "EEE, MMM do"); // Returns format like "Thu, Apr 3rd"
};

/**
 * Gets text for remaining days until a date
 */
const getDaysRemaining = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const days = differenceInDays(date, today);
  
  return days === 1 ? "(tomorrow)" : `(${days} days away)`;
};

/**
 * Generates a personalized welcome message template with user context
 */
export const generateWelcomeMessage = ({ 
  userInfo, 
  examActivities, 
  studyActivities,
  gameState
}: GenerateWelcomeMessageProps): string => {
  // Get user's name
  const userName = userInfo?.firstName || "there";
  
  // Get current time and day
  const currentDay = format(new Date(), "EEEE");
  const currentTime = format(new Date(), "h:mm a");
  
  // Extract game state information
  const { streakDays, testScore, userLevel, totalPatients } = gameState;
  
  // Get upcoming exams (for full length exams)
  const upcomingExams = examActivities
    .filter(a => new Date(a.scheduledDate) > new Date())
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 1);
  
  // Get recent activities for today's tasks
  const todayActivities = studyActivities
    .filter(a => isToday(new Date(a.scheduledDate)))
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    
  // Build the new message format that directly mirrors the example
  let message = `${getTimeGreeting()}, ${userName}! It's ${currentTime} on ${currentDay}`;
  
  // Add a study session suggestion based on time of day
  const hour = new Date().getHours();
  if (hour < 12) {
    message += " - perfect for a morning study session.\n\n";
  } else if (hour < 17) {
    message += " - great time for a focused study block.\n\n";
  } else {
    message += " - ideal for reviewing key concepts.\n\n";
  }
  
  // Add upcoming exam info with days countdown
  if (upcomingExams.length > 0) {
    const exam = upcomingExams[0];
    message += `Your next full-length practice exam is scheduled for ${format(new Date(exam.scheduledDate), "MMMM do")} ${getDaysRemaining(exam.scheduledDate)}.\n\n`;
  }
  
  // Add strength/weakness info if test score exists (simplified example)
  if (testScore > 0) {
    // This is placeholder - in a real implementation, you would pull this data from 
    // a user profile or analytics service that tracks subject performance
    message += `You're consistent in CARS but could use improvement in Biochemistry, specifically in amino acid properties and enzyme kinetics.\n\n`;
  }
  
  // Add today's tasks
  const completedTasks = todayActivities.filter(a => a.status === 'completed').length;
  if (todayActivities.length > 0) {
    message += `Your tasks for today are: ${todayActivities.map(a => a.activityTitle).join(', ')}. `;
    message += `You've completed ${completedTasks} so far. Check out your tasks for today!\n\n`;
  } else {
    message += `You don't have any specific tasks scheduled for today. Consider adding some study activities!\n\n`;
  }
  
  // Add clinic and patient info
  // Assuming 20 patients per day is the current rate - in real implementation,
  // this would come from the game state or user profile
  const patientsPerDay = 20; // This would ideally come from a gameState property
  if (totalPatients > 0) {
    message += `Your clinic currently treats ${patientsPerDay} patients a day and you've treated a total of ${totalPatients}. Make sure to visit today so that you can earn enough points!\n\n`;
  }
  
  message += "What can I help you with?";
  
  return message;
}; 