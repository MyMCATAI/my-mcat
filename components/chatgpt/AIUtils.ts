/**
 * Helper function to format knowledge data into a readable summary
 */
export const generateKnowledgeSummary = (
  weakestConcepts: any[] = [], 
  sectionSummaries: any[] = [], 
  overallMastery: number = 0
) => {
  // Format overall mastery as percentage
  const masteryPercent = Math.round(overallMastery * 100);
  
  // Get strongest and weakest sections
  const sortedSections = [...sectionSummaries].sort((a, b) => b.averageMastery - a.averageMastery);
  const strongestSection = sortedSections.length > 0 ? sortedSections[0] : null;
  const weakestSection = sortedSections.length > 0 ? sortedSections[sortedSections.length - 1] : null;
  
  // Format section mastery percentages
  const strongestPercent = strongestSection ? Math.round(strongestSection.averageMastery * 100) : 0;
  const weakestPercent = weakestSection ? Math.round(weakestSection.averageMastery * 100) : 0;
  
  // Get top 3 concepts that need work
  const weakConcepts = weakestConcepts.slice(0, 3).map(concept => {
    const masteryPercent = Math.round(concept.mastery * 100);
    return `${concept.concept} (${concept.section}, ${masteryPercent}% mastery)`;
  });
  
  return {
    welcomeMessageSummary: `Your overall mastery is at ${masteryPercent}%. ${
      strongestSection ? `Your strongest area is ${strongestSection.section} at ${strongestPercent}%` : ''
    }${
      weakestSection ? `, while ${weakestSection.section} needs more focus at ${weakestPercent}%` : ''
    }. ${
      weakConcepts.length > 0 ? `Consider focusing on: ${weakConcepts.join(', ')}` : ''
    }`,
    
    detailedStats: {
      overallMastery: masteryPercent,
      strongestSection: strongestSection ? {
        name: strongestSection.section,
        mastery: strongestPercent
      } : null,
      weakestSection: weakestSection ? {
        name: weakestSection.section,
        mastery: weakestPercent
      } : null,
      weakConcepts: weakConcepts
    }
  };
};

/**
 * Generate AI context object for user profile
 */
export const generateUserContext = (
  userInfo: any,
  isSubscribed: boolean,
  gameState: { 
    userLevel: string, 
    streakDays: number, 
    totalPatients: number, 
    testScore: number 
  },
  knowledgeState: {
    weakestConcepts: any[],
    sectionSummaries: any[],
    overallMastery: number
  },
  activities: {
    examActivities: any[],
    studyActivities: any[]
  },
  preferences: {
    audioEnabled: boolean
  }
) => {
  // Calculate overall mastery percentage
  const overallMasteryPercent = knowledgeState.overallMastery !== undefined ? 
    `${Math.round(knowledgeState.overallMastery * 100)}%` : null;
  
  // Today's activities and upcoming exams
  const todaysActivities = getTodaysStudyActivities(activities.studyActivities);
  const upcomingExams = getUpcomingExamActivities(activities.examActivities);
  const weeklyActivities = getUpcomingWeekActivities(activities.studyActivities, activities.examActivities);
  
  // Current time info
  const hour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());
  const isLateNight = hour >= 22 || hour <= 5;
  
  return {
    user: {
      userId: userInfo?.userId || 'anonymous',
      firstName: userInfo?.firstName || 'User',
      subscription: isSubscribed ? 'Premium' : 'Free',
      hasFullProfile: !!userInfo?.onboardingInfo?.onboardingComplete
    },
    game: {
      level: gameState.userLevel || 'Beginner',
      streakDays: gameState.streakDays || 0,
      totalPatients: gameState.totalPatients || 0,
      testScore: gameState.testScore || 0
    },
    knowledge: {
      overallMastery: overallMasteryPercent,
      weakestConcepts: knowledgeState.weakestConcepts?.slice(0, 3).map(concept => ({
        concept: concept.concept,
        section: concept.section,
        mastery: `${Math.round(concept.mastery * 100)}%`
      })) || [],
      sectionSummaries: knowledgeState.sectionSummaries?.map(section => ({
        name: section.section,
        mastery: `${Math.round(section.averageMastery * 100)}%`,
        conceptCount: section.totalConcepts
      })) || []
    },
    calendar: {
      totalExams: activities.examActivities?.length || 0,
      totalStudyActivities: activities.studyActivities?.length || 0,
      todaysActivities: todaysActivities,
      upcomingExams: upcomingExams,
      weeklyActivities: weeklyActivities
    },
    time: {
      greeting: getTimeGreeting(),
      hour: hour,
      isWeekend: isWeekend,
      isLateNight: isLateNight
    },
    preferences: {
      audio: preferences.audioEnabled
    }
  };
};

/**
 * Checks if a welcome message needs to be generated or fetched from cache
 */
export const checkAndGenerateWelcomeMessage = async ({
  userInfo,
  examActivities,
  studyActivities,
  gameState,
  knowledgeState,
  welcomeMessageGenerator,
  cachedMessageHandler
}: {
  userInfo: any;
  examActivities: any[];
  studyActivities: any[];
  gameState: {
    streakDays: number;
    testScore: number;
    userLevel: string;
    totalPatients: number;
  };
  knowledgeState: {
    weakestConcepts: any[];
    sectionSummaries: any[];
    overallMastery: number;
  };
  welcomeMessageGenerator: Function;
  cachedMessageHandler?: (message: string) => void;
}): Promise<string> => {
  // Define keys for localStorage
  const localStorageKey = `welcome-message-${userInfo?.userId || 'anonymous'}`;
  const lastApiCallTimeKey = `welcome-api-last-call-${userInfo?.userId || 'anonymous'}`;
  
  // Check cache in localStorage first before generating new message
  const cachedData = localStorage.getItem(localStorageKey);
  
  if (cachedData) {
    try {
      const { message, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      const cacheAge = now - timestamp;
      const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
      
      // Use cached message if it's not too old
      if (cacheAge < MAX_CACHE_AGE) {
        
        // Notify about using cached message if handler provided
        if (cachedMessageHandler) {
          cachedMessageHandler(message);
        }
        
        return message;
      }
    } catch (err) {
      console.error('[AIUtils] Error parsing cached welcome message:', err);
    }
  }
  
  // Check rate limiting for API calls
  const lastApiCallTime = localStorage.getItem(lastApiCallTimeKey);
  if (lastApiCallTime) {
    const now = Date.now();
    const timeSinceLastCall = now - Number(lastApiCallTime);
    const MIN_API_CALL_INTERVAL = 10000; // 10 seconds
    
    if (timeSinceLastCall < MIN_API_CALL_INTERVAL) {
      
      // Try to use cached message even if older
      if (cachedData) {
        try {
          const { message } = JSON.parse(cachedData);
          
          // Notify about using cached message if handler provided
          if (cachedMessageHandler) {
            cachedMessageHandler(message);
          }
          
          return message;
        } catch (err) {
          console.error('[AIUtils] Error parsing stale cached welcome message:', err);
        }
      }
      
      // Return a fallback message if no cache
      return "Welcome to Premedley!";
    }
  }
  
  // Generate new welcome message
  
  // Record API call time
  localStorage.setItem(lastApiCallTimeKey, Date.now().toString());
  
  try {
    // Log the knowledge summary that will be used
    if (knowledgeState?.weakestConcepts?.length) {
      const summary = generateKnowledgeSummary(
        knowledgeState.weakestConcepts, 
        knowledgeState.sectionSummaries, 
        knowledgeState.overallMastery
      );
    }
    
    // Generate the welcome message
    const generatedMessage = welcomeMessageGenerator({
      userInfo,
      examActivities,
      studyActivities,
      gameState,
      knowledgeState
    });
    
    // Cache the message
    localStorage.setItem(localStorageKey, JSON.stringify({
      message: generatedMessage,
      timestamp: Date.now()
    }));
    
    return generatedMessage;
  } catch (error) {
    console.error('[AIUtils] Error generating welcome message:', error);
    return "Welcome to MyMCAT.ai! How can I help you today?";
  }
};

/**
 * Gets appropriate time-of-day greeting
 */
export const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/**
 * Gets today's study activities formatted for the welcome message
 */
export const getTodaysStudyActivities = (studyActivities: any[] = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return studyActivities
    .filter(activity => {
      const activityDate = new Date(activity.scheduledDate);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === today.getTime();
    })
    .map(act => ({
      title: act.activityTitle,
      hours: act.hours,
      type: act.activityType,
      status: act.status || 'PENDING'
    }));
};

/**
 * Gets activities for a specific date
 */
export const getActivitiesForDate = (studyActivities: any[] = [], targetDate: Date) => {
  targetDate.setHours(0, 0, 0, 0);
  
  return studyActivities
    .filter(activity => {
      const activityDate = new Date(activity.scheduledDate);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === targetDate.getTime();
    })
    .map(act => ({
      title: act.activityTitle,
      hours: act.hours,
      type: act.activityType,
      status: act.status || 'PENDING'
    }));
};

/**
 * Gets upcoming exam activities formatted for the welcome message
 */
export const getUpcomingExamActivities = (examActivities: any[] = []) => {
  const today = new Date();
  
  return examActivities
    .filter(activity => {
      const activityDate = new Date(activity.scheduledDate);
      return activityDate >= today;
    })
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 3)
    .map(exam => ({
      title: exam.activityTitle,
      date: new Date(exam.scheduledDate).toLocaleDateString(),
      daysUntil: Math.ceil((new Date(exam.scheduledDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }));
};

/**
 * Gets activities for the upcoming week
 */
export const getUpcomingWeekActivities = (studyActivities: any[] = [], examActivities: any[] = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  // Get both study and exam activities for the next 7 days
  const upcomingStudy = studyActivities
    .filter(activity => {
      const activityDate = new Date(activity.scheduledDate);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate >= today && activityDate < nextWeek;
    })
    .map(act => ({
      title: act.activityTitle,
      type: act.activityType,
      hours: act.hours,
      status: act.status || 'PENDING',
      date: new Date(act.scheduledDate).toLocaleDateString(),
      isExam: false
    }));
    
  const upcomingExams = examActivities
    .filter(activity => {
      const activityDate = new Date(activity.scheduledDate);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate >= today && activityDate < nextWeek;
    })
    .map(act => ({
      title: act.activityTitle,
      type: act.activityType,
      hours: act.hours,
      status: act.status || 'PENDING',
      date: new Date(act.scheduledDate).toLocaleDateString(),
      isExam: true
    }));
    
  // Combine and sort by date
  return [...upcomingStudy, ...upcomingExams]
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
};

/**
 * Creates a concise personalized welcome message from context data
 */
export const formatWelcomeMessage = (welcomeContext: any): string => {
  if (!welcomeContext || !welcomeContext.user) {
    return "Welcome to MyMCAT.ai! How can I help you today?";
  }

  const { user, game, knowledge, calendar, time } = welcomeContext;
  
  // Get current time details
  const now = new Date();
  const hour = time.hour || now.getHours();
  const minute = now.getMinutes();
  const formattedTime = `${hour % 12 || 12}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  
  // Create a time-aware greeting based on hour
  let timeAwareGreeting = '';
  
  if (hour >= 0 && hour < 4) {
    // Late night (12am-4am)
    timeAwareGreeting = `<div>It's ${formattedTime} on ${dayOfWeek}! Impressive dedication studying at this hour. Just remember that sleep is crucial for memory consolidation too.</div>`;
  } else if (hour >= 4 && hour < 7) {
    // Early morning (4am-7am)
    timeAwareGreeting = `<div>It's ${formattedTime} on ${dayOfWeek}! Getting an early start shows real commitment. Make sure to fuel your brain with a good breakfast.</div>`;
  } else if (hour >= 7 && hour < 12) {
    // Morning (7am-12pm)
    timeAwareGreeting = `<div>It's ${formattedTime} on ${dayOfWeek}! Morning is perfect for tackling challenging concepts with your fresh mind.</div>`;
  } else if (hour >= 12 && hour < 17) {
    // Afternoon (12pm-5pm)
    timeAwareGreeting = `<div>It's ${formattedTime} on ${dayOfWeek}! The afternoon is great for building on your morning progress.</div>`;
  } else if (hour >= 17 && hour < 20) {
    // Evening (5pm-8pm)
    timeAwareGreeting = `<div>It's ${formattedTime} on ${dayOfWeek}! Evening review sessions can help solidify what you've learned today.</div>`;
  } else {
    // Night (8pm-12am)
    timeAwareGreeting = `<div>It's ${formattedTime} on ${dayOfWeek}! A focused night session before winding down for sleep can be very effective.</div>`;
  }
  
  // Add day-of-week specific notes
  if (dayOfWeek === 'Monday') {
    timeAwareGreeting += `<div>Starting the week strong sets a great tone for productive studying!</div>`;
  } else if (dayOfWeek === 'Friday') {
    timeAwareGreeting += `<div>It's Friday! Keep the momentum going as you head into the weekend.</div>`;
  } else if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
    timeAwareGreeting += `<div>Weekend studying shows dedication, but remember to balance with some rest too.</div>`;
  } else if (dayOfWeek === 'Wednesday') {
    timeAwareGreeting += `<div>Mid-week already! You're making steady progress.</div>`;
  }
  
  // Start with greeting and name
  let message = `<div style="font-family: inherit; line-height: 1.5;">${time.greeting}, ${user.firstName || 'there'}!</div>`;
  
  // Add our time-aware greeting
  message += timeAwareGreeting;
  
  // Add a study session suggestion based on time of day
  if (hour < 12) {
    message += `<div>This morning is great for tackling difficult concepts.</div>`;
  } else if (hour < 17) {
    message += `<div>The afternoon is perfect for practicing problems and consolidating knowledge.</div>`;
  } else {
    message += `<div>Evening is ideal for reviewing key concepts and organizing tomorrow's plan.</div>`;
  }
  
  // Today's activities section
  if (calendar.todaysActivities && calendar.todaysActivities.length > 0) {
    const activities = calendar.todaysActivities;
    const completedCount = activities.filter((a: { status: string }) => 
      a.status.toLowerCase() === 'completed' || a.status.toLowerCase() === 'complete'
    ).length;
    
    message += `<div style="margin-top: 14px;"><strong style="color: var(--theme-text-color);">📅 TODAY'S SCHEDULE:</strong></div>`;
    message += `<div>You have ${activities.length} activities (${completedCount}/${activities.length} completed):</div>`;
    
    // List each activity on its own line with bullet points
    message += `<ul style="margin-top: 4px; margin-bottom: 8px; padding-left: 20px;">`;
    activities.forEach((a: { title: string; hours: number; status: string }) => {
      const statusIcon = a.status === 'COMPLETED' || a.status === 'completed' ? '✅' : '⏳';
      message += `<li>${statusIcon} ${a.title} (${a.hours}h)</li>`;
    });
    message += `</ul>`;
  } else {
    message += `<div style="margin-top: 14px;">You don't have any specific tasks scheduled for today. Consider adding some study activities!</div>`;
  }
  
  // Upcoming exam section
  if (calendar.upcomingExams && calendar.upcomingExams.length > 0) {
    const nextExam = calendar.upcomingExams[0];
    message += `<div style="margin-top: 14px;"><strong style="color: var(--theme-text-color);">📝 UPCOMING EXAM:</strong></div>`;
    message += `<div>${nextExam.title} in ${nextExam.daysUntil} days</div>`;
    
    // If there are multiple exams, mention it
    if (calendar.upcomingExams.length > 1) {
      message += `<div>You have ${calendar.upcomingExams.length} exams scheduled in the coming weeks.</div>`;
    }
  }
  
  // Knowledge section with enhanced details
  if (knowledge.sectionSummaries?.length > 0) {
    message += `<div style="margin-top: 14px;"><strong style="color: var(--theme-text-color);">📊 MASTERY PROFILE:</strong></div>`;
    
    // Overall mastery
    if (knowledge.overallMastery) {
      message += `<div>Overall mastery: ${knowledge.overallMastery}</div>`;
    }
    
    // Find strongest and weakest sections
    const sections = [...knowledge.sectionSummaries];
    sections.sort((a, b) => parseInt(b.mastery) - parseInt(a.mastery));
    
    const strongest = sections.length > 0 ? sections[0] : null;
    const weakest = sections.length > 0 ? sections[sections.length - 1] : null;
    
    if (strongest && weakest && strongest.name !== weakest.name) {
      message += `<div>Strongest in ${strongest.name} (${strongest.mastery}), needs work in ${weakest.name} (${weakest.mastery})</div>`;
    }
  }
  
  // Focus areas (weakest concepts)
  if (knowledge.weakestConcepts?.length > 0) {
    // Sort by mastery to find the weakest
    const sortedConcepts = [...knowledge.weakestConcepts].sort(
      (a, b) => parseInt(a.mastery) - parseInt(b.mastery)
    );
    
    message += `<div style="margin-top: 14px;"><strong style="color: var(--theme-text-color);">📚 FOCUS AREAS:</strong></div>`;
    // List top 2 weakest concepts
    message += `<ul style="margin-top: 4px; margin-bottom: 8px; padding-left: 20px;">`;
    sortedConcepts.slice(0, 2).forEach((concept) => {
      message += `<li>${concept.concept} in ${concept.section} (${concept.mastery} mastery)</li>`;
    });
    message += `</ul>`;
  }
  
  // Add clinic and patient info
  if (game.totalPatients > 0) {
    const patientsPerDay = 20; // Assuming 20 patients per day
    message += `<div style="margin-top: 14px;"><strong style="color: var(--theme-text-color);">🏥 CLINIC:</strong></div>`;
    message += `<div>Your clinic treats ${patientsPerDay} patients a day. Total patients treated: ${game.totalPatients}</div>`;
  }
  
  // Add study streak if available
  if (game && game.streakDays > 0) {
    message += `<div style="margin-top: 14px;"><span style="color: var(--theme-text-color);">🔥 You're on a ${game.streakDays}-day study streak! Keep it up!</span></div>`;
    
    // Add extra motivation for streaks
    if (game.streakDays > 7) {
      message += `<div>Over a week of consistent studying - that's how long-term progress happens!</div>`;
    }
  }
  
  // End with a simple question based on time of day
  if (hour < 10) {
    message += `<div style="margin-top: 14px;">What would you like to focus on this morning?</div>`;
  } else if (hour < 16) {
    message += `<div style="margin-top: 14px;">What can I help you accomplish this afternoon?</div>`;
  } else {
    message += `<div style="margin-top: 14px;">How can I assist with your evening study plans?</div>`;
  }
  
  return message;
};

/**
 * Defines the structure of a task within an activity
 */
interface ActivityTask {
  text: string;
  completed: boolean;
}

/**
 * Defines the structure of a study or exam activity
 */
interface StudyActivity {
  id?: string;
  activityTitle: string;
  activityText?: string;
  hours: number;
  activityType: string;
  status: string;
  scheduledDate: string;
  tasks?: ActivityTask[];
}

/**
 * Creates a first-person narrative context for the AI conversation
 */
export const createFirstPersonContext = (
  userInfo: any,
  isSubscribed: boolean,
  gameState: { 
    userLevel: string, 
    streakDays: number, 
    totalPatients: number, 
    testScore: number 
  },
  knowledgeState: {
    weakestConcepts: any[],
    sectionSummaries: any[],
    overallMastery: number
  },
  activities: {
    examActivities: any[],
    studyActivities: any[]
  },
  preferences: {
    audioEnabled: boolean
  }
): string => {
  // Ensure we have valid data - initialize empty arrays for missing data
  const examActivities = activities?.examActivities || [];
  const studyActivities = activities?.studyActivities || [];
  const weakestConcepts = knowledgeState?.weakestConcepts || [];
  const sectionSummaries = knowledgeState?.sectionSummaries || [];
  
  // Current date and time information
  const now = new Date();
  const hour = now.getHours();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayOfWeek = dayNames[now.getDay()];
  const month = monthNames[now.getMonth()];
  const dayOfMonth = now.getDate();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  
  // Time of day descriptor
  let timeOfDay = "morning";
  if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
  else if (hour >= 17) timeOfDay = "evening";
  
  // Get today's activities
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysActivities = studyActivities
    .filter((activity: StudyActivity) => {
      if (!activity.scheduledDate) return false;
      const activityDate = new Date(activity.scheduledDate);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === today.getTime();
    });
  
  // Get future activities for the next 7 days
  const futureActivities = studyActivities
    .filter((activity: StudyActivity) => {
      if (!activity.scheduledDate) return false;
      const activityDate = new Date(activity.scheduledDate);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate > today && activityDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    })
    .sort((a: StudyActivity, b: StudyActivity) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  
  // Find upcoming exams
  const upcomingExams = examActivities
    .filter((exam: StudyActivity) => {
      if (!exam.scheduledDate) return false;
      return new Date(exam.scheduledDate) >= today;
    })
    .sort((a: StudyActivity, b: StudyActivity) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  
  // Begin context message in first person
  let context = `My name is ${userInfo?.firstName || 'Anonymous'}. I'm studying for the MCAT. It's ${timeStr} on ${dayOfWeek}, ${month} ${dayOfMonth}.\n\n`;
  
  // Subscription info
  context += `I ${isSubscribed ? 'have' : 'do not have'} a premium subscription.\n\n`;
  
  // Today's schedule
  if (todaysActivities.length > 0) {
    console.log(todaysActivities)
    const completedCount = todaysActivities.filter((a: StudyActivity) => 
      a.status === 'Complete' || a.status === 'COMPLETED' || a.status === 'completed'
    ).length;
    
    context += `Here's my schedule for today (${completedCount}/${todaysActivities.length} completed):\n`;
    
    todaysActivities.forEach((activity: StudyActivity) => {
      const status = activity.status === 'Complete' || activity.status === 'COMPLETED' || activity.status === 'completed' 
                  ? 'Completed' : 'Not started';
      context += `- ${activity.activityTitle} (${activity.hours} hours, ${activity.activityType}, ${status})\n`;
      if (activity.activityText) {
        context += `  Description: ${activity.activityText.split('.')[0]}.\n`;
      }
      
      // Include tasks if available
      if (activity.tasks && activity.tasks.length > 0) {
        context += `  Tasks:\n`;
        activity.tasks.forEach((task: ActivityTask) => {
          const taskStatus = task.completed ? '✓' : '□';
          context += `  ${taskStatus} ${task.text}\n`;
        });
      }
      context += '\n';
    });
  } else {
    context += `I don't have any activities scheduled for today.\n\n`;
  }
  
  // Weekly schedule
  if (futureActivities.length > 0) {
    context += `Here's my upcoming schedule for the next week:\n`;
    
    // Group by date - properly typed with an index signature
    const groupedByDate: { [key: string]: StudyActivity[] } = {};
    
    futureActivities.forEach((activity: StudyActivity) => {
      if (!activity.scheduledDate) return;
      
      const date = new Date(activity.scheduledDate);
      const dateKey = date.toDateString();
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(activity);
    });
    
    // List activities by date
    Object.keys(groupedByDate).forEach(dateKey => {
      const date = new Date(dateKey);
      const dayName = dayNames[date.getDay()];
      const monthName = monthNames[date.getMonth()];
      const dayOfMonthVal = date.getDate();
      
      context += `${dayName}, ${monthName} ${dayOfMonthVal}:\n`;
      
      groupedByDate[dateKey].forEach((activity: StudyActivity) => {
        context += `- ${activity.activityTitle} (${activity.hours || 0} hours, ${activity.activityType || 'Study'})\n`;
        
        // Include tasks for upcoming activities too (optional)
        if (activity.tasks && activity.tasks.length > 0) {
          context += `  Tasks: ${activity.tasks.map((t: ActivityTask) => t.text).join(', ')}\n`;
        }
      });
      context += '\n';
    });
  }
  
  // Upcoming exams
  if (upcomingExams.length > 0) {
    context += `My upcoming exams:\n`;
    upcomingExams.slice(0, 3).forEach((exam: StudyActivity) => {
      if (!exam.scheduledDate) return;
      
      const examDate = new Date(exam.scheduledDate);
      const daysUntil = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      context += `- ${exam.activityTitle} in ${daysUntil} days (${dayNames[examDate.getDay()]}, ${monthNames[examDate.getMonth()]} ${examDate.getDate()})\n`;
    });
    context += '\n';
  }
  
  // Knowledge profile
  if (weakestConcepts.length > 0 || knowledgeState?.overallMastery !== undefined) {
    context += `My knowledge profile:\n`;
    
    // Overall mastery
    if (knowledgeState?.overallMastery !== undefined) {
      context += `- Overall mastery: ${Math.round(knowledgeState.overallMastery * 100)}%\n`;
    }
    
    // Add sections info
    if (sectionSummaries.length > 0) {
      // Sort sections by mastery
      const sortedSections = [...sectionSummaries].sort((a, b) => b.averageMastery - a.averageMastery);
      
      if (sortedSections.length > 0) {
        // Strongest and weakest sections
        const strongest = sortedSections[0];
        const weakest = sortedSections[sortedSections.length - 1];
        
        if (strongest) {
          context += `- Strongest section: ${strongest.section} (${Math.round(strongest.averageMastery * 100)}%)\n`;
        }
        
        if (weakest) {
          context += `- Weakest section: ${weakest.section} (${Math.round(weakest.averageMastery * 100)}%)\n`;
        }
      }
    }
    
    // List weakest concepts
    if (weakestConcepts.length > 0) {
      context += `- My weak concepts that need focus:\n`;
      weakestConcepts.slice(0, 5).forEach(concept => {
        context += `  • ${concept.concept} in ${concept.section} (${Math.round(concept.mastery * 100)}% mastery)\n`;
      });
    }
    context += '\n';
  }
  
  // Game status
  if (gameState) {
    context += `My game progress:\n`;
    if (gameState.userLevel) {
      context += `- Level: ${gameState.userLevel}\n`;
    }
    if (gameState.streakDays) {
      context += `- Study streak: ${gameState.streakDays} days\n`;
    }
    if (gameState.totalPatients > 0) {
      context += `- Clinic patients treated: ${gameState.totalPatients}\n`;
    }
    if (gameState.testScore > 0) {
      context += `- My last test score: ${gameState.testScore}\n`;
    }
    context += '\n';
  }
  
  // Preferences
  context += `My preferences: I prefer ${preferences?.audioEnabled ? 'to have' : 'not to have'} voice responses.\n`;
  
  return context;
}; 