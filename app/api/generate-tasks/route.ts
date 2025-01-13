import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { GET as getEventTasks } from '../event-task/route';
import { format } from 'date-fns';


// Update EVENT_CATEGORIES type definition
interface EventCategory {
  name: string;
  optional?: boolean;
  minDuration?: number;
  maxDuration?: number;
  duration?: number;
  priority: number;
  type: string;
  description: string;
}

// Define task categories with their properties
const EVENT_CATEGORIES: EventCategory[] = [
  {
    name: 'MyMCAT Daily CARs',
    optional: true,
    minDuration: 0.5,
    maxDuration: 1,
    priority: 3,
    type: 'Practice',
    description: "Practice CARS passages to improve your critical analysis and reasoning skills. Focus on understanding complex arguments, identifying main ideas, and developing your reading speed and comprehension.",
  },
  {
    name: 'Daily CARs',
    optional: true,
    minDuration: 0.5,
    maxDuration: 1,
    priority: 3,
    type: 'Practice',
    description: "Practice CARS passages to improve your critical analysis and reasoning skills. Focus on understanding complex arguments, identifying main ideas, and developing your reading speed and comprehension.",
  },
  {
    name: 'Adaptive Tutoring Suite',
    optional: true,
    minDuration: 1,
    maxDuration: 3,
    priority: 1,
    type: 'Review',
    description: "Engage with personalized content tailored to your knowledge gaps. Review key concepts, practice problem-solving, and strengthen your understanding of challenging topics through interactive learning modules.",
  },
  {
    name: 'Anki Clinic',
    optional: true,
    minDuration: 0.5,
    maxDuration: 1.5,
    priority: 2,
    type: 'Review',
    description: "Review and reinforce key concepts using spaced repetition. Focus on high-yield facts, strengthen your recall ability, and maintain long-term retention of important MCAT content.",
  },
  {
    name: 'Regular Anki',
    optional: true,
    minDuration: 0.5,
    maxDuration: 1.5,
    priority: 2,
    type: 'Review',
    description: "Review and reinforce key concepts using spaced repetition with your own Anki deck. Focus on high-yield facts, strengthen your recall ability, and maintain long-term retention of important MCAT content.",
  },
  {
    name: 'UWorld',
    minDuration: 1,
    maxDuration: 3,
    priority: 3,
    type: 'practice',
    description: "Complete UWorld question blocks focusing on identifying knowledge gaps and improving test-taking strategies. Review explanations thoroughly and create notes on commonly missed concepts.",
  },
  {
    name: 'AAMC Materials',
    duration: 2,
    priority: 3,
    type: 'practice',
    description: "Work through official AAMC practice materials to familiarize yourself with actual MCAT-style questions. Focus on understanding the reasoning behind correct and incorrect answers to improve your test-taking approach.",
  }
];

interface Resources {
  uworld: boolean;
  aamc: boolean;
  adaptive: boolean;
  ankigame: boolean;
  anki: boolean;
}

interface CalendarActivity {
  userId: string;
  studyPlanId: string;
  categoryId?: string | null;
  contentId?: string | null;
  activityText: string;
  activityTitle: string;
  hours: number;
  activityType: string;
  link?: string;
  scheduledDate: Date;
  status: string;
  tasks: Task[];
  source: string;
}

interface Task {
  text: string;
  completed: boolean;
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log('Request body:', body); // Log entire request body

    const {
      examDate,
      resources,
      hoursPerDay,
      selectedBalance,
      startDate = new Date(),
      endDate
    } = body;

    // Log each required field
    console.log('Required fields check:', {
      examDate,
      resources,
      hoursPerDay,
      selectedBalance,
      endDate
    });

    if (!examDate || !resources || !hoursPerDay || !selectedBalance || !endDate) {
      // Log which specific fields are missing
      const missingFields = {
        examDate: !examDate,
        resources: !resources,
        hoursPerDay: !hoursPerDay,
        selectedBalance: !selectedBalance,
        endDate: !endDate
      };
      console.log('Missing fields:', missingFields);
      
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get existing study plan
    const studyPlan = await prisma.studyPlan.findFirst({
      where: { userId }
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "No study plan found" }, { status: 404 });
    }

    // First, delete all existing non-exam activities from startDate onwards
    await prisma.calendarActivity.deleteMany({
      where: {
        userId,
        studyPlanId: studyPlan.id,
        scheduledDate: {
          gte: new Date(startDate)
        },
        activityType: {
          not: 'Exam'
        }
      }
    });

    // Generate activities for the date range
    const activities = await generateDailyTasks(
      studyPlan.id,
      userId,
      resources,
      hoursPerDay,
      selectedBalance,
      new Date(startDate),
      new Date(endDate)
    );

    // Add default tasks to each activity
    const activitiesWithTasks = await Promise.all(
      activities.map(async (activity) => {
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

    // Create activities in database
    await prisma.calendarActivity.createMany({
      data: activitiesWithTasks
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error generating tasks:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateDailyTasks(
  studyPlanId: string,
  userId: string,
  resources: Resources,
  hoursPerDay: { [key: string]: string },
  selectedBalance: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarActivity[]> {
  console.log('\n=== Starting Daily Task Generation ===');
  console.log('Resources:', resources);
  console.log('Hours per Day:', hoursPerDay);
  console.log('Selected Balance:', selectedBalance);
  console.log('Date Range:', format(startDate, 'yyyy-MM-dd'), 'to', format(endDate, 'yyyy-MM-dd'));

  const activities: CalendarActivity[] = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Use fixed content review ratio based on selection
  const contentReviewRatio = getContentReviewRatio(selectedBalance);

  // Get exam schedule from database
  const examActivities = await prisma.calendarActivity.findMany({
    where: {
      userId,
      studyPlanId,
      activityType: 'Exam',
      scheduledDate: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      scheduledDate: 'asc'
    }
  });

  const examSchedule = examActivities.map(activity => ({
    date: activity.scheduledDate,
    examName: activity.activityTitle
  }));

  // Generate CARS schedule
  const carsDays = generateCarsSchedule(startDate, endDate);

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dayName = daysOfWeek[dayOfWeek];
    const availableHours = parseInt(hoursPerDay[dayName]) || 0;

    // Skip if it's a break day or an exam day
    const isExamDay = examActivities.some(exam => 
      format(new Date(exam.scheduledDate), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
    );

    if (availableHours === 0 || isExamDay) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const dayTasks = getAvailableTasks(
      resources,
      contentReviewRatio,
      new Set<string>(),
      availableHours,
      carsDays.has(currentDate.getTime()),
      currentDate,
      examSchedule
    );

    // Create activities for each task
    for (const task of dayTasks) {
      activities.push({
        userId,
        studyPlanId,
        categoryId: null,
        contentId: null,
        activityText: getActivityDescription(task.name),
        activityTitle: task.name,
        hours: task.duration,
        activityType: task.type,
        link: '',
        scheduledDate: new Date(currentDate),
        status: "Not Started",
        tasks: [],
        source: "generated"
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log('Total Activities Generated:', activities.length);
  console.log('=== Task Generation Complete ===\n');

  return activities;
}

function getContentReviewRatio(balance: string): number {
  switch (balance) {
    case '75-25': return 0.75;
    case '25-75': return 0.25;
    case '50-50':
    default: return 0.5;
  }
}

function generateCarsSchedule(startDate: Date, endDate: Date): Set<number> {
  const availableDays: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    availableDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const NUM_AAMC_CARS = Math.min(18, Math.floor(availableDays.length / 3));
  const selectedDays = new Set<number>();
  
  // Select days with increasing probability towards the exam
  for (let i = 0; i < NUM_AAMC_CARS; i++) {
    const dayIndex = Math.floor(Math.random() * availableDays.length);
    selectedDays.add(availableDays[dayIndex].getTime());
  }

  return selectedDays;
}

// Helper function to determine which FL milestone we're between
function getCurrentFLMilestone(currentDate: Date, examSchedule: { date: Date; examName: string }[]): number {
  // Sort exams by date to ensure chronological order
  const sortedExams = [...examSchedule].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // If before first exam, return 0
  if (currentDate < sortedExams[0].date) {
    return 0;
  }
  
  // Find which exams we're between
  for (let i = 0; i < sortedExams.length - 1; i++) {
    if (currentDate >= sortedExams[i].date && currentDate < sortedExams[i + 1].date) {
      return i + 1;
    }
  }
  
  // If after last exam, return the total number of exams
  return sortedExams.length;
}

function getAvailableTasks(
  resources: Resources,
  contentReviewRatio: number,
  scheduledTasksForDay: Set<string>,
  availableHours: number,
  isAamcCarsDay: boolean,
  currentDate: Date,
  examSchedule: { date: Date; examName: string }[]
): { name: string; duration: number; type: string }[] {
  console.log('\n--- Task Generation Details ---');
  console.log('Date:', format(currentDate, 'yyyy-MM-dd'));
  console.log('Available Hours:', availableHours);
  console.log('Is Review Day:', Math.random() < contentReviewRatio);
  console.log('Is AAMC CARS Day:', isAamcCarsDay);
  console.log('Current FL Milestone:', getCurrentFLMilestone(currentDate, examSchedule));

  const tasks: { name: string; duration: number; type: string }[] = [];
  const isReviewDay = Math.random() < contentReviewRatio;
  let remainingHours = availableHours;

  // Get duration constants from EVENT_CATEGORIES with safe defaults
  const ATS = EVENT_CATEGORIES.find(c => c.name === 'Adaptive Tutoring Suite')!;
  const ANKI = EVENT_CATEGORIES.find(c => c.name === 'Anki Clinic')!;
  const REGULAR_ANKI = EVENT_CATEGORIES.find(c => c.name === 'Regular Anki')!;
  const CARS = EVENT_CATEGORIES.find(c => c.name === 'Daily CARs')!;
  const UWORLD = EVENT_CATEGORIES.find(c => c.name === 'UWorld')!;
  const AAMC = EVENT_CATEGORIES.find(c => c.name === 'AAMC Materials')!;

  const ATS_MIN = ATS.minDuration ?? 1;
  const ATS_MAX = ATS.maxDuration ?? 3;
  const ANKI_MIN = ANKI.minDuration ?? 0.5;
  const ANKI_MAX = ANKI.maxDuration ?? 1.5;
  const CARS_MIN = CARS.minDuration ?? 0.5;
  const CARS_MAX = CARS.maxDuration ?? 1;
  const UWORLD_MIN = UWORLD.minDuration ?? 1;
  const UWORLD_MAX = UWORLD.maxDuration ?? 3;
  const AAMC_DUR = AAMC.duration ?? 2;

  // Get current FL milestone
  const currentMilestone = getCurrentFLMilestone(currentDate, examSchedule);

  if (isReviewDay) {
    // Review day priority: Adaptive > Anki > CARs
    if (resources.adaptive && remainingHours >= ATS_MIN) {
      const duration = Math.min(ATS_MAX, remainingHours - (ANKI_MIN + CARS_MIN));
      tasks.push({ name: 'Adaptive Tutoring Suite', duration, type: ATS.type });
      remainingHours -= duration;
    }

    // Handle either Anki Game or Regular Anki
    if ((resources.ankigame || resources.anki) && remainingHours >= ANKI_MIN) {
      const duration = Math.min(ANKI_MAX, remainingHours - CARS_MIN);
      const ankiType = resources.ankigame ? 'Anki Clinic' : 'Regular Anki';
      tasks.push({ name: ankiType, duration, type: ANKI.type });
      remainingHours -= duration;
    }
  } else {
    // Practice day priority changes based on FL milestone
    if (currentMilestone >= 3) {
      // After FL3, prioritize AAMC
      if (resources.aamc && remainingHours >= AAMC_DUR) {
        tasks.push({ name: 'AAMC Materials', duration: AAMC_DUR, type: AAMC.type });
        remainingHours -= AAMC_DUR;
      }
      if (resources.uworld && remainingHours >= UWORLD_MIN) {
        const uWorldHours = Math.min(UWORLD_MAX, Math.floor(remainingHours));
        tasks.push({ name: 'UWorld', duration: uWorldHours, type: UWORLD.type });
        remainingHours -= uWorldHours;
      }
    } else {
      // Before FL3, prioritize UWorld
      if (resources.uworld && remainingHours >= UWORLD_MIN) {
        const uWorldHours = Math.min(UWORLD_MAX, Math.floor(remainingHours));
        tasks.push({ name: 'UWorld', duration: uWorldHours, type: UWORLD.type });
        remainingHours -= uWorldHours;
      }
      if (resources.aamc && remainingHours >= AAMC_DUR) {
        tasks.push({ name: 'AAMC Materials', duration: AAMC_DUR, type: AAMC.type });
        remainingHours -= AAMC_DUR;
      }
    }

    // Handle either Anki Game or Regular Anki
    if ((resources.ankigame || resources.anki) && remainingHours >= ANKI_MIN) {
      const duration = Math.min(ANKI_MAX, remainingHours);
      const ankiType = resources.ankigame ? 'Anki Clinic' : 'Regular Anki';
      tasks.push({ name: ankiType, duration, type: ANKI.type });
      remainingHours -= duration;
    }
  }

  // Always try to add CARS if there's time
  if (remainingHours >= CARS_MIN) {
    const duration = Math.min(CARS_MAX, remainingHours);
    tasks.push({
      name: isAamcCarsDay ? 'Daily CARs' : 'MyMCAT Daily CARs',
      duration,
      type: CARS.type
    });
  }

  console.log('Generated Tasks:', tasks);
  console.log('Remaining Hours:', remainingHours);
  console.log('------------------------\n');
  
  return tasks;
}

function getActivityDescription(taskName: string): string {
  const category = EVENT_CATEGORIES.find(c => c.name === taskName);
  return category?.description || `Work on ${taskName}`;
}
