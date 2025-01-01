// app/api/generate-study-plan/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { Prisma } from '@prisma/client';
import { GET as getEventTasks } from '../event-task/route';

// Define task categories with their properties
// keep word consistent
const EVENT_CATEGORIES = [
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
    name: 'UWorld',
    duration: 1,
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
  },
  {
    name: 'Full-Length Exam',
    duration: 8,
    priority: 5,
    type: 'Exam',
    description: "Complete a full-length practice exam under test-day conditions. Maintain strict timing, take appropriate breaks, and simulate the actual testing environment to build stamina and familiarity with the MCAT format.",
  },
  {
    name: 'Take Up Exam',
    totalDuration: 5,
    chunkable: true,
    chunkSize: 1,
    priority: 4,
    type: 'Review',
    description: "Review your full-length exam in detail. Analyze each question, understand the reasoning behind correct and incorrect answers, identify patterns in your mistakes, and create targeted study plans to address weak areas.",
  },
];

// Define interfaces for TypeScript
interface StudyPlan {
  id: string;
  userId: string;
  creationDate: Date;
  examDate: Date;
  resources: Prisma.JsonValue;
  hoursPerDay: Prisma.JsonValue;
  fullLengthDays: Prisma.JsonValue;
  updatedAt: Date;
}

interface Resources {
  hasUWorld: boolean;
  hasAAMC: boolean;
  hasAdaptiveTutoringSuite: boolean;
  hasAnki: boolean;
}

interface KnowledgeProfile {
  id: string;
  userId: string;
  categoryId: string;
  conceptMastery: number | null; // Allow null values
  category: Category;
  // Add any other fields that might be present in your Prisma model
}

interface Category {
  id: string;
  subjectCategory: string;
  contentCategory: string;
  conceptCategory: string;
  generalWeight: number;
  section: string;
  color: string;
  icon: string;
}

interface ContentItem {
  id: string;
  title: string;
  minutes_estimate: number;
  type: string;
  link: string;
  categoryId: string;
}

interface Task {
  text: string;
  completed: boolean;
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

interface CategoryAllocation extends KnowledgeProfile {
  allocatedHours: number;
}

interface SelectedContentItem extends ContentItem {
  category: Category;
}

// Handler for generating the study plan
export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse the request body to get user input
    const body = await req.json();
    const {
      examDate,
      resources,
      hoursPerDay,
      fullLengthDays,
      contentReviewRatio = 0.8,
      useKnowledgeProfile = false,
      alternateStudyPractice = false,
      includeSpecificContent = false,
    } = body;

    if (!examDate || !resources || !hoursPerDay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    
    const selectedExamDate = new Date(examDate);
    if (selectedExamDate > oneYearFromNow) {
      return NextResponse.json({ 
        error: "Exam date cannot be more than 1 year in the future" 
      }, { status: 400 });
    }

    today.setHours(0, 0, 0, 0);

    // Find existing study plan and activities for the user
    const existingStudyPlan = await prisma.studyPlan.findFirst({
      where: { userId },
    });

    // If there's an existing plan, only delete future activities
    if (existingStudyPlan) {
      await prisma.calendarActivity.deleteMany({
        where: {
          studyPlanId: existingStudyPlan.id,
          scheduledDate: {
            gte: today
          }
        }
      });
    }

    // Create or update the study plan
    const studyPlan: StudyPlan = await prisma.studyPlan.upsert({
      where: { 
        id: existingStudyPlan?.id ?? 'new_study_plan'
      },
      update: {
        examDate: new Date(examDate),
        resources,
        hoursPerDay,
        fullLengthDays,
        updatedAt: new Date()
      },
      create: {
        userId,
        examDate: new Date(examDate),
        resources,
        hoursPerDay,
        fullLengthDays,
      },
    });

    // Fetch knowledge profiles if requested
    let knowledgeProfiles: KnowledgeProfile[] = [];
    if (useKnowledgeProfile) {
      knowledgeProfiles = await prisma.knowledgeProfile.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { conceptMastery: 'asc' },
      });
    }

    // Fetch content if including specific content items
    let contentItems: ContentItem[] = [];
    if (includeSpecificContent) {
      contentItems = await prisma.content.findMany();
    }

    // Generate the study schedule
    const calendarActivities = await generateStudySchedule(
      studyPlan,
      resources,
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

    // Use createMany for bulk insertion
    await prisma.calendarActivity.createMany({
      data: activitiesWithTasks
    });
    console.log("Finished adding activities to database");
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(`Time taken: ${duration / 1000} seconds`);

    return NextResponse.json({ message: "Study plan generated successfully" }, { status: 201 });
  } catch (error) {
    console.error('Error generating study plan:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Function to generate the study schedule
// 1. Create exam schedule
// 2. Create AAMC CARS schedule
// 3. loop through each days from current to exam date
// 4. if user can take FL exam today, schedule it
// 5. else fill up the day with tasks(check if there's available hours left, if not, move on to next day); use loop to keep track of available hours
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

