// app/api/generate-study-plan/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

// Define types
interface StudyPlan {
  id: string;
  userId: string;
  examDate: Date;
  resources: Resources;
  hoursPerDay: { [key: string]: string };
  fullLengthDays: string[];
}

interface Resources {
  hasUWorld: boolean;
  hasAAMC: boolean;
  hasAdaptiveTutoringSuite: boolean;
  hasAnki: boolean;
  hasThirdPartyFLs?: boolean;
}

interface CalendarActivity {
  id?: string;
  userId?: string;
  studyPlanId?: string;
  scheduledDate: Date;
  activityTitle: string;
  activityText: string;
  hours: number;
  activityType: string;
  link?: string | null;
  tasks?: any[];
  source?: string;
}

// Helper function to create activity
function createActivity(
  studyPlan: StudyPlan,
  title: string,
  type: string,
  hours: number,
  date: Date,
  tasks: string[] = []
): CalendarActivity {
  return {
    scheduledDate: date,
    activityTitle: title,
    activityText: EVENT_CATEGORIES.find(cat => cat.name === title)?.description || "",
    hours,
    activityType: type,
    tasks: tasks.map(task => ({ text: task, completed: false }))
  };
}

// Define task categories with their properties
const EVENT_CATEGORIES = [
  {
    name: 'MyMCAT Daily CARs',
    duration: 1,
    priority: 3,
    type: 'Practice',
    description: "Practice CARS passages to improve your critical analysis and reasoning skills.",
    tasks: [
      "Complete 2 CARS passages",
      "Review and analyze your answers",
      "Note down challenging question types"
    ]
  },
  {
    name: 'Adaptive Tutoring Suite',
    duration: 2,
    priority: 1,
    type: 'Review',
    description: "Engage with personalized content tailored to your knowledge gaps.",
    tasks: [
      "Complete assigned content review",
      "Take practice questions",
      "Review explanations thoroughly"
    ]
  },
  {
    name: 'Anki Clinic',
    duration: 1,
    priority: 2,
    type: 'Review',
    description: "Review and reinforce key concepts using spaced repetition.",
    tasks: [
      "Complete your daily Anki cards",
      "Add new cards for concepts learned today",
      "Review flagged cards"
    ]
  },
  {
    name: 'UWorld',
    duration: 1,
    priority: 3,
    type: 'Practice',
    description: "Complete UWorld question blocks.",
    tasks: [
      "Complete 40 questions",
      "Review all explanations thoroughly",
      "Make notes on missed concepts"
    ]
  },
  {
    name: 'Full-Length Exam',
    duration: 8,
    priority: 5,
    type: 'Exam',
    description: "Complete a full-length practice exam under test-day conditions.",
    tasks: [
      "Complete Chemical and Physical Foundations section",
      "Complete CARS section",
      "Complete Biological and Biochemical Foundations section",
      "Complete Psychological, Social, and Biological Foundations section"
    ]
  }
];

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      examDate,
      resources,
      hoursPerDay,
      fullLengthDays,
    } = body;

    if (!examDate || !hoursPerDay || !fullLengthDays) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Delete existing activities and study plan
    await prisma.calendarActivity.deleteMany({
      where: { userId }
    });

    // Create new study plan
    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId,
        examDate: new Date(examDate),
        resources,
        hoursPerDay,
        fullLengthDays,
      },
    });

    // Generate schedule
    const activities = await generateStudySchedule(
      {
        ...studyPlan,
        resources: resources as Resources,
        hoursPerDay: hoursPerDay as { [key: string]: string },
        fullLengthDays: fullLengthDays as string[]
      },
      resources as Resources,
      hoursPerDay,
      fullLengthDays,
      today
    );
    console.log("Finished generating study schedule");
    console.log("There are ", calendarActivities.length, " activities");

    const startTime = new Date();
    const activitiesWithTasks = await Promise.all(
      calendarActivities.map(async (activity) => {
        const mockRequest = new Request(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/event-task?eventTitle=${encodeURIComponent(activity.activityTitle)}`
        );
        
        const tasksResponse = await getEventTasks(mockRequest);
        const defaultTasks = await tasksResponse.json();
        
        return {
          ...activity,
          tasks: defaultTasks ? JSON.parse(JSON.stringify(defaultTasks)) : []
        };
      })
    );

    // Create all activities
    await prisma.calendarActivity.createMany({
      data: activities.map(activity => ({
        ...activity,
        userId,
        studyPlanId: studyPlan.id,
        source: 'generated'
      }))
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error generating study plan:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateStudySchedule(
  studyPlan: StudyPlan,
  resources: Resources,
  hoursPerDay: { [key: string]: string },
  fullLengthDays: string[],
  startDate: Date = new Date()
): Promise<CalendarActivity[]> {
  const activities: CalendarActivity[] = [];
  const examDate = new Date(studyPlan.examDate);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Add welcome activity on first day
  const welcomeActivity = createWelcomeActivity(studyPlan, startDate);
  activities.push(welcomeActivity);

  const availableExams = [
    "AAMC Unscored Sample",
    "AAMC Full Length Exam 1",
    "AAMC Full Length Exam 2",
    "AAMC Full Length Exam 3",
    "AAMC Full Length Exam 4",
    "AAMC Sample Scored (FL5)"
  ];
  let examSchedule: { date: Date; examName: string }[] = [];
  
  if (fullLengthDays.length > 0) {
    // Schedule Unscored Sample on first available day
    let firstExamDate = new Date(startDate);
    while (!fullLengthDays.includes(daysOfWeek[firstExamDate.getDay()])) {
      firstExamDate.setDate(firstExamDate.getDate() + 1);
    }
    examSchedule.push({
      date: new Date(firstExamDate),
      examName: availableExams[0] // Unscored Sample
    });

    // Schedule FL5 on last possible day (at least 5 days before exam)
    let lastExamDate = new Date(examDate);
    lastExamDate.setDate(lastExamDate.getDate() - 5); // 5 days buffer
    while (!fullLengthDays.includes(daysOfWeek[lastExamDate.getDay()])) {
      lastExamDate.setDate(lastExamDate.getDate() - 1);
    }
    examSchedule.push({
      date: new Date(lastExamDate),
      examName: availableExams[5] // FL5
    });

    // Calculate available time between first and last exam
    const daysAvailable = Math.ceil(
      (lastExamDate.getTime() - firstExamDate.getTime()) / (1000 * 3600 * 24)
    );
    
    // Determine how many middle exams we can fit (minimum 4 days between exams)
    const possibleExams = Math.min(4, Math.floor(daysAvailable / 4) - 1);
    
    if (possibleExams > 0) {
      const examInterval = Math.floor(daysAvailable / (possibleExams + 1));
      let currentExamDate = new Date(firstExamDate);
      
      // Schedule only the latest possible FLs based on available time
      // e.g., if we can fit 2 exams, use FL4 and FL3
      for (let i = 0; i < possibleExams; i++) {
        currentExamDate.setDate(currentExamDate.getDate() + examInterval);
        while (!fullLengthDays.includes(daysOfWeek[currentExamDate.getDay()])) {
          currentExamDate.setDate(currentExamDate.getDate() + 1);
        }
        
        if (currentExamDate.getTime() < lastExamDate.getTime()) {
          examSchedule.push({
            date: new Date(currentExamDate),
            examName: availableExams[5 - possibleExams + i] // Start from highest FL number available
          });
        }
      }
    }
  }

  // Sort exams by date
  examSchedule.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Create activities for each scheduled exam
  examSchedule.forEach(({ date, examName }) => {
    activities.push(createActivity(
      studyPlan,
      examName,
      'Exam',
      8,
      date
    ));
  });

  return activities;
}

function createWelcomeActivity(studyPlan: StudyPlan, date: Date): CalendarActivity {
  return {
    userId: studyPlan.userId,
    studyPlanId: studyPlan.id,
    categoryId: null,
    contentId: null,
    activityText: "Welcome to your study plan! Here are some initial tasks to get started.",
    activityTitle: "Welcome!",
    hours: 0.25, // No specific hours needed for this activity
    activityType: "Special",
    link: '',
    scheduledDate: date,
    status: "Not Started",
    tasks: [],
    source: "generated",
  };
}

// Function to calculate total available study hours
function calculateTotalAvailableHours(hoursPerDay: { [key: string]: string }, studyPlan: StudyPlan): number {
  const today = new Date();
  const examDate = new Date(studyPlan.examDate);
  const totalDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let totalHours = 0;
  let currentDate = new Date(today);

  for (let i = 0; i < totalDays; i++) {
    const dayOfWeek = currentDate.getDay();
    const dayName = daysOfWeek[dayOfWeek];
    totalHours += parseInt(hoursPerDay[dayName]) || 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return totalHours;
}

// Function to allocate study time based on knowledge profiles
function allocateStudyTime(knowledgeProfiles: KnowledgeProfile[], totalStudyHours: number): CategoryAllocation[] {
  // Calculate total inverse mastery, treating null as 0 (lowest mastery)
  const totalInverseMastery = knowledgeProfiles.reduce((sum, profile) => 
    sum + (1 - (profile.conceptMastery ?? 0)), 0);

  return knowledgeProfiles.map(profile => ({
    ...profile,
    allocatedHours: totalStudyHours * ((1 - (profile.conceptMastery ?? 0)) / totalInverseMastery),
  }));
}

// Function to select content for each category
function selectContent(
  categoryAllocations: CategoryAllocation[],
  contentItems: ContentItem[]
): { category: Category; content: SelectedContentItem[] }[] {
  return categoryAllocations.map(category => {
    const categoryContent = contentItems.filter(c => c.categoryId === category.categoryId);
    let remainingHours = category.allocatedHours;
    const selected: SelectedContentItem[] = [];

    while (remainingHours > 0 && categoryContent.length > 0) {
      const randomIndex = Math.floor(Math.random() * categoryContent.length);
      const selectedContent = categoryContent[randomIndex];

      if (selectedContent.minutes_estimate / 60 <= remainingHours) {
        selected.push({
          ...selectedContent,
          category: category.category,
        });
        remainingHours -= selectedContent.minutes_estimate / 60;
        categoryContent.splice(randomIndex, 1);
      } else {
        break;
      }
    }

    return {
      category: category.category,
      content: selected,
    };
  });
}

// Function to get the next content activity
function getNextContentActivity(
  selectedContent: { category: Category; content: SelectedContentItem[] }[],
  currentDate: Date,
  isStudySession: boolean,
  studyPlan: StudyPlan
): CalendarActivity | null {
  for (const categoryContent of selectedContent) {
    if (categoryContent.content.length > 0) {
      const contentItem = categoryContent.content.shift()!;
      const contentHours = contentItem.minutes_estimate / 60;
      const activityType = isStudySession ? 'Study' : 'Practice';

      const activity = {
        userId: studyPlan.userId,
        studyPlanId: studyPlan.id,
        categoryId: contentItem.categoryId,
        contentId: contentItem.id,
        activityText: `${activityType} ${contentItem.title}`,
        activityTitle: `${activityType} ${contentItem.title}`,
        hours: contentHours,
        activityType: contentItem.type,
        link: contentItem.link,
        scheduledDate: new Date(currentDate),
        status: "Not Started",
        tasks: [],
        source: "generated",
      };
      return activity;
    }
  }
  return null;
}

// Function to schedule Take Up Exam sessions
// return the date of the take up exam
async function scheduleTakeUpExam(
  activities: CalendarActivity[],
  studyPlan: StudyPlan,
  examDate: Date,
  hoursPerDay: { [key: string]: string }
) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let currentDate = new Date(examDate);
  currentDate.setDate(currentDate.getDate() + 1);
  const finalExamDate = new Date(studyPlan.examDate);
  let takeUpExamDate: Date | null = null;

  // Look for the next day with at least 4 hours available
  while (currentDate < finalExamDate) {
    const dayName = daysOfWeek[currentDate.getDay()];
    const availableHours = parseInt(hoursPerDay[dayName]) || 0;

    if (availableHours >= 4) {
      const takeUpExamActivity = createActivity(studyPlan, 'Take Up Exam', 'Review', 4, currentDate);
      activities.push(takeUpExamActivity);
      takeUpExamDate = currentDate;
      takeUpExamDate.setHours(0, 0, 0, 0);
      break;
    }

    currentDate.setDate(currentDate.getDate() + 1);
    }

  return takeUpExamDate;
}

// Function to determine the main task based on contentReviewRatio and available resources
function getAvailableTasks(
  resources: Resources, 
  contentReviewRatio: number,
  scheduledTasksForDay: Set<string>,
  hoursUntilExam: number,
  totalDays: number,
  aamcCarsSchedule: Set<number>,
  currentDate: Date,
  availableHours: number,
  takeUpExamDate: Date | null
): { name: string; duration: number; type: string }[] {
  const tasks: { name: string; duration: number; type: string }[] = [];
  const isReviewDay = Math.random() < contentReviewRatio;
  const isNearExam = hoursUntilExam < 180;
  let remainingHours = availableHours;
  let takeUpExamTasks = 0;

  let currentDateZeroHours = new Date(currentDate);
  currentDateZeroHours.setHours(0, 0, 0, 0);
  
  if (takeUpExamDate && currentDateZeroHours.getTime() === takeUpExamDate.getTime()) {
    takeUpExamTasks += 1;
    remainingHours -= 4;
  }

  let ATS_max: number = EVENT_CATEGORIES[2].maxDuration ?? 3;
  let ATS_min: number = EVENT_CATEGORIES[2].minDuration ?? 1;
  let ATS_type: string = EVENT_CATEGORIES[2].type;
  let Anki_max: number = EVENT_CATEGORIES[3].maxDuration ?? 1.5;
  let Anki_min: number = EVENT_CATEGORIES[3].minDuration ?? 0.5;
  let Anki_type: string = EVENT_CATEGORIES[3].type;
  let CARs_max: number = EVENT_CATEGORIES[1].maxDuration ?? 1;
  let CARs_min: number = EVENT_CATEGORIES[1].minDuration ?? 0.5;
  let CARs_type: string = EVENT_CATEGORIES[1].type;
  let UWorld_type: string = EVENT_CATEGORIES[4].type;
  let AAMC_type: string = EVENT_CATEGORIES[5].type;

  if (isReviewDay) {
    // Review day priority: ATS > Anki > CARs
    if (remainingHours >= ATS_min) {
      let atsDuration = remainingHours >= ATS_min ? 
        Math.min(ATS_max, remainingHours - (Anki_min + CARs_min)) : 
        0;
      atsDuration = Math.max(ATS_min, atsDuration);
      tasks.push({ name: 'Adaptive Tutoring Suite', duration: atsDuration, type: ATS_type });
      remainingHours -= atsDuration;
    }

    if (remainingHours >= Anki_min) {
      let ankiDuration = remainingHours >= Anki_min ? 
        Math.min(Anki_max, remainingHours - CARs_min) : 
        0;
      ankiDuration = Math.max(Anki_min, ankiDuration);
      tasks.push({ name: 'Anki Clinic', duration: ankiDuration, type: Anki_type });
      remainingHours -= ankiDuration;
    }

    if (remainingHours >= CARs_min) {
      // CARs last (30-60 min)
      const carsDuration = Math.min(1, remainingHours);
      const useAAMCCars = aamcCarsSchedule.has(currentDate.getTime());
      tasks.push({ 
        name: useAAMCCars ? 'Daily CARs' : 'MyMCAT Daily CARs', 
        duration: carsDuration,
        type: CARs_type
      });
    }
  } else {
    // Practice day
    // no UWorld or AAMC, priority: Anki > ATS > CARs
    // With UWorld or AAMC, priority: UWorld > AAMC > Anki > CARs
    if (resources.hasUWorld || resources.hasAAMC) {
      if (remainingHours >= 2) {
        if (resources.hasUWorld) {
          tasks.push({ name: 'UWorld', duration: Math.min(2, remainingHours), type: UWorld_type });
          remainingHours -= 2;
        }
      }
      
      if (remainingHours >= 2) {
        if (isNearExam && resources.hasAAMC) {
          // Prioritize AAMC near exam
          tasks.push({ name: 'AAMC Materials', duration: Math.min(2, remainingHours), type: AAMC_type });
          remainingHours -= 2;
        }
      }

      if (remainingHours >= 0.5) {
        tasks.push({ name: 'Anki Clinic', duration: Math.min(1, remainingHours), type: Anki_type });
        remainingHours -= 1;
      }

      if (remainingHours >= 0.5) {
        const useAAMCCars = aamcCarsSchedule.has(currentDate.getTime());
        if (tasks.length + takeUpExamTasks <= 3) {
          tasks.push({ 
            name: useAAMCCars ? 'Daily CARs' : 'MyMCAT Daily CARs', 
            duration: Math.min(1, remainingHours),
            type: CARs_type
          });
        }
      } 
    } else {
      // No UWorld or AAMC, priority: Anki > ATS > CARs
      if (remainingHours >= Anki_min) {
        let ankiDuration = remainingHours >= Anki_min ? 
          Math.min(Anki_max, remainingHours - (ATS_min + CARs_min)) : 
        0;
      ankiDuration = Math.max(Anki_min, ankiDuration);
        tasks.push({ name: 'Anki Clinic', duration: ankiDuration, type: Anki_type });
        remainingHours -= ankiDuration;
      }

      if (remainingHours >= ATS_min) {
        let atsDuration = remainingHours >= ATS_min ? 
          Math.min(ATS_max, remainingHours - CARs_min) : 
          0;
        atsDuration = Math.max(ATS_min, atsDuration);
        tasks.push({ name: 'Adaptive Tutoring Suite', duration: atsDuration, type: ATS_type });
        remainingHours -= atsDuration;
      }

      if (remainingHours >= 0.5) {
        // CARs last (30-60 min)
        const carsDuration = Math.min(1, remainingHours);
        const useAAMCCars = aamcCarsSchedule.has(currentDate.getTime());
        
        if (tasks.length + takeUpExamTasks <= 3) {
          tasks.push({ 
            name: useAAMCCars ? 'Daily CARs' : 'MyMCAT Daily CARs', 
            duration: carsDuration,
            type: CARs_type
          });
        }
      }
    }
  }

  return tasks;
}

// Function to create an activity object
function createActivity(
  studyPlan: StudyPlan,
  name: string,
  type: string,
  duration: number,
  date: Date
): CalendarActivity {
  const taskCategory = EVENT_CATEGORIES.find(t => t.name === name);
  const scheduledDate = new Date(date);
  // Set the time to noon (12:00)
  scheduledDate.setHours(12, 0, 0, 0);
  
  const activity = {
    userId: studyPlan.userId,
    studyPlanId: studyPlan.id,
    categoryId: null,
    contentId: null,
    activityText: taskCategory?.description || `Work on ${name}`,
    activityTitle: name,
    hours: duration,
    activityType: type,
    link: '',
    scheduledDate,
    status: "Not Started",
    tasks: [], // Will be populated with default tasks
    source: "generated",
  };
  return activity;
}

const THIRD_PARTY_EXAMS = [
  "Unscored sample full Length Exam",
  "Full Length Exam(FL1)",
  "Full Length Exam(FL2)",
  "Full Length Exam(FL3)",
  "Full Length Exam(FL4)",
];

const AAMC_EXAMS = [
  "AAMC Unscored Sample",
  "AAMC Full Length Exam 1",
  "AAMC Full Length Exam 2",
  "AAMC Full Length Exam 3",
  "AAMC Full Length Exam 4",
  "AAMC Sample Scored (FL5)"
];

