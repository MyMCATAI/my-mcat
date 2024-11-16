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
    duration: 0.5,
    priority: 2,
    description: "Practice CARS passages to improve your critical analysis and reasoning skills. Focus on understanding complex arguments, identifying main ideas, and developing your reading speed and comprehension.",
  },
  {
    name: 'Daily CARs',
    optional: true,
    duration: 1,
    priority: 2,
    description: "Practice CARS passages to improve your critical analysis and reasoning skills. Focus on understanding complex arguments, identifying main ideas, and developing your reading speed and comprehension.",
  },
  {
    name: 'Adaptive Tutoring Suite',
    optional: true,
    duration: 3,
    chunkable: true,
    chunkSize: 1,
    priority: 2,
    type: 'Content',
    description: "Engage with personalized content tailored to your knowledge gaps. Review key concepts, practice problem-solving, and strengthen your understanding of challenging topics through interactive learning modules.",
  },
  {
    name: 'Anki Clinic',
    optional: true,
    duration: 0.5,
    priority: 2,
    type: 'Content',
    description: "Review and reinforce key concepts using spaced repetition. Focus on high-yield facts, strengthen your recall ability, and maintain long-term retention of important MCAT content.",
  },
  {
    name: 'UWorld',
    duration: 2,
    priority: 3,
    type: 'Review',
    description: "Complete UWorld question blocks focusing on identifying knowledge gaps and improving test-taking strategies. Review explanations thoroughly and create notes on commonly missed concepts.",
  },
  {
    name: 'AAMC Materials',
    duration: 2,
    priority: 3,
    type: 'Review',
    description: "Work through official AAMC practice materials to familiarize yourself with actual MCAT-style questions. Focus on understanding the reasoning behind correct and incorrect answers to improve your test-taking approach.",
  },
  {
    name: 'Full-Length Exam',
    duration: 8,
    priority: 5,
    description: "Complete a full-length practice exam under test-day conditions. Maintain strict timing, take appropriate breaks, and simulate the actual testing environment to build stamina and familiarity with the MCAT format.",
  },
  {
    name: 'Take Up Exam',
    totalDuration: 5,
    chunkable: true,
    chunkSize: 1,
    priority: 4,
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
      contentReviewRatio,
      knowledgeProfiles,
      contentItems,
      alternateStudyPractice,
      includeSpecificContent,
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
  contentReviewRatio: number,
  knowledgeProfiles: KnowledgeProfile[],
  contentItems: ContentItem[],
  alternateStudyPractice: boolean,
  includeSpecificContent: boolean,
  startDate: Date = new Date()
): Promise<CalendarActivity[]> {
  const activities: CalendarActivity[] = [];
  const examDate = new Date(studyPlan.examDate);
  const totalDays = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let isStudySession = true;

  let totalAvailableHours = calculateTotalAvailableHours(hoursPerDay, studyPlan);

  // Allocate study time per category if using knowledge profiles
  let categoryAllocations: CategoryAllocation[] = [];
  if (knowledgeProfiles.length > 0) {
    categoryAllocations = allocateStudyTime(knowledgeProfiles, totalAvailableHours);
  }

  // Select content per category if including specific content items
  let selectedContent: { category: Category; content: SelectedContentItem[] }[] = [];
  if (includeSpecificContent && categoryAllocations.length > 0) {
    selectedContent = selectContent(categoryAllocations, contentItems);
  }

  // Calculate exam schedule if more than 70 days until exam
  const availableExams = [...THIRD_PARTY_EXAMS];
  if (resources.hasAAMC) {
    availableExams.push(...AAMC_EXAMS);
  }
  
  // Handle full length exams
  let examSchedule: { date: Date; examName: string }[] = [];
  const daysForFLExams = Math.min(totalDays, 70);
  const daysBeforeLastExam = 5; // Buffer before final exam
  const examInterval = Math.floor((daysForFLExams - daysBeforeLastExam) / availableExams.length);
  
  // Schedule exams backwards from the exam date
  let currentExamDate = new Date(examDate);
  currentExamDate.setDate(currentExamDate.getDate() - daysBeforeLastExam);
  
  if (fullLengthDays.length > 0) {
    for (let i = availableExams.length - 1; i >= 0; i--) {
      // Find the next available full length day
      while (!fullLengthDays.includes(daysOfWeek[currentExamDate.getDay()])) {
        currentExamDate.setDate(currentExamDate.getDate() - 1);
      }
      
      examSchedule.unshift({
        date: new Date(currentExamDate),
        examName: availableExams[i]
      });
      
      currentExamDate.setDate(currentExamDate.getDate() - examInterval);
    }
  }

  // Handle CARs schedule
  // P(i) = i^exponent / sum of all weights
  // weights = [i**exponent for i in range(1, total_days + 1)]
  // Generate AAMC CARS schedule after exam schedule is created
  const NUM_AAMC_CARS = 18;
  const CARS_EXPONENT = 4;
  
  // Create array of available days (excluding exam days)
  const availableDays: Date[] = [];
  let tempDate = new Date(startDate);
  while (tempDate < examDate) {
    // Check if this day isn't a full-length exam day
    if (!examSchedule.some(exam => exam.date.getTime() === tempDate.getTime())) {
      availableDays.push(new Date(tempDate));
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }


  const n = availableDays.length;

  // For x^4: sum = (n(n+1)(2n+1)(3n^2 + 3n - 1))/30
  const totalWeight = (n * (n + 1) * (2 * n + 1) * (3 * n * n + 3 * n - 1)) / 30;

  const cumulativeProbabilities = new Array(n);
  let cumSum = 0;
  for (let i = 0; i < n; i++) {
    cumSum += Math.pow(i + 1, CARS_EXPONENT) / totalWeight;
    cumulativeProbabilities[i] = Number(cumSum.toFixed(3));
  }

  const aamcCarsDays = new Set<number>();
  const availableIndices = new Set(Array.from({ length: n }, (_, i) => i));

  // Select NUM_AAMC_CARS days using optimized binary search
  while (aamcCarsDays.size < NUM_AAMC_CARS && availableIndices.size > 0) {
    // Skew probability distribution towards 1
    const r = Math.pow(Math.random(), 2/CARS_EXPONENT);
    
    let left = 0;
    let right = n - 1;
    let selectedIdx = right;
    
    if (r <= cumulativeProbabilities[0]) {
      selectedIdx = 0;
    } else if (r >= cumulativeProbabilities[right]) {
      selectedIdx = right;
    } else {
      while (right - left > 1) {
        const mid = (left + right) >> 1;
        if (cumulativeProbabilities[mid] > r) {
          right = mid;
        } else {
          left = mid;
        }
      }
      selectedIdx = right;
    }
    
    // Find next available index if current is used
    while (!availableIndices.has(selectedIdx) && selectedIdx < n) {
      selectedIdx++;
    }
    if (selectedIdx >= n) {
      selectedIdx = Math.max(...Array.from(availableIndices));
    }
    
    aamcCarsDays.add(selectedIdx);
    availableIndices.delete(selectedIdx);
  }

  const aamcCarsSchedule = new Set(
    Array.from(aamcCarsDays).map(index => availableDays[index].getTime())
  );

  // Calculate initial content review ratio (80/20)
  // Probably use contentReviewRatio
  let currentReviewRatio = 0.8;
  const ratioChangePerDay = (0.8 - 0.2) / totalDays; // Linear progression from 80/20 to 20/80

  let currentDate = new Date(startDate);

  while (currentDate < examDate) {
    const dayOfWeek = currentDate.getDay();
    const dayName = daysOfWeek[dayOfWeek];
    const availableHours = parseInt(hoursPerDay[dayName]) || 0;
    
    const scheduledTasksForDay = new Set<string>();

    // Check if there's a scheduled exam for this day
    const scheduledExam = examSchedule.find(exam => 
      exam.date.getTime() === currentDate.getTime()
    );

    if (scheduledExam) {
      // Schedule full length exam
      const examActivity = createActivity(
        studyPlan,
        scheduledExam.examName,
        'Exam',
        8,
        currentDate
      );
      activities.push(examActivity);

      // Schedule take-up exam for the following days
      await scheduleTakeUpExam(activities, studyPlan, currentDate, hoursPerDay);
    } else {
      if (availableHours === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      let remainingHours = availableHours;
      let activityScheduled = false;

      if (includeSpecificContent && selectedContent.length > 0) {
        const contentActivity = getNextContentActivity(selectedContent, currentDate, isStudySession, studyPlan);
        if (contentActivity && contentActivity.hours <= remainingHours && !scheduledTasksForDay.has(contentActivity.activityTitle)) {
          activities.push(contentActivity);
          scheduledTasksForDay.add(contentActivity.activityTitle);
          remainingHours -= contentActivity.hours;
          activityScheduled = true;
        }
      }

      if (alternateStudyPractice) {
        isStudySession = !isStudySession;
      }

      // Get available tasks for the day(either review or practice)
      const dayTasks = getAvailableTasks(
        resources,
        currentReviewRatio,
        scheduledTasksForDay,
        totalAvailableHours,
        totalDays,
        aamcCarsSchedule,
        currentDate
      );

      // Schedule each task according to available hours
      for (const taskName of dayTasks) {
        const task = EVENT_CATEGORIES.find(t => t.name === taskName);
        if (task && typeof task.duration === 'number' && remainingHours >= task.duration) {
          const activity = createActivity(
            studyPlan,
            taskName,
            task.type || 'Study',
            task.duration,
            currentDate
          );
          activities.push(activity);
          scheduledTasksForDay.add(taskName);
          remainingHours -= task.duration;
        }
      }
    }

    totalAvailableHours -= availableHours;
    currentReviewRatio -= ratioChangePerDay;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return activities;
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
      };
      return activity;
    }
  }
  return null;
}

// Function to schedule Take Up Exam sessions
async function scheduleTakeUpExam(
  activities: CalendarActivity[],
  studyPlan: StudyPlan,
  examDate: Date,
  hoursPerDay: { [key: string]: string }
) {
  let remainingReviewHours = 5;
  let currentDate = new Date(examDate);
  currentDate.setDate(currentDate.getDate() + 1);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const finalExamDate = new Date(studyPlan.examDate);

  while (remainingReviewHours > 0) {
    if (currentDate >= finalExamDate) {
      break;
    }

    const dayOfWeek = currentDate.getDay();
    const dayName = daysOfWeek[dayOfWeek];
    const availableHours = parseInt(hoursPerDay[dayName]) || 0;

    if (availableHours > 0) {
      const reviewHours = Math.min(availableHours, remainingReviewHours);
      const takeUpExamActivity = createActivity(studyPlan, 'Take Up Exam', 'Review', reviewHours, currentDate);
      activities.push(takeUpExamActivity);
      remainingReviewHours -= reviewHours;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
}

// Function to determine the main task based on contentReviewRatio and available resources
function getAvailableTasks(
  resources: Resources, 
  contentReviewRatio: number,
  scheduledTasksForDay: Set<string>,
  hoursUntilExam: number,
  totalDays: number,
  aamcCarsSchedule: Set<number>,
  currentDate: Date
): string[] {
  const tasks: string[] = [];
  const isReviewDay = Math.random() < contentReviewRatio;
  
  // Calculate CARS duration based on exam proximity
  // More 30-min sessions early on, more 60-min sessions closer to exam

  // Determine CARS type based on schedule
  if (!scheduledTasksForDay.has('MyMCAT Daily CARs') && !scheduledTasksForDay.has('Daily CARs')) {
    const useAAMCCars = aamcCarsSchedule.has(currentDate.getTime());
    tasks.push(useAAMCCars ? 'Daily CARs' : 'MyMCAT Daily CARs');
  }

  if (!scheduledTasksForDay.has('Adaptive Tutoring Suite')) {
    tasks.push('Adaptive Tutoring Suite');
  }
  
  if (!scheduledTasksForDay.has('Anki Clinic')) {
    tasks.push('Anki Clinic');
  }

  // Handle review vs practice days
  if (isReviewDay) {
    // Review day has ATS, Anki, and CARs
    return tasks;
  } else {
    // Practice day: Replace ATS and Anki with practice materials
    // If less than 180 hours until exam and has AAMC materials, prioritize AAMC
    if (hoursUntilExam < 180 && resources.hasAAMC && !scheduledTasksForDay.has('AAMC Materials')) {
      return ['AAMC Materials', tasks[0]]; // Keep CARS, replace others with AAMC
    }
    
    // If has UWorld and not already scheduled
    if (resources.hasUWorld && !scheduledTasksForDay.has('UWorld')) {
      return ['UWorld', tasks[0]]; // Keep CARS, replace others with UWorld
    }
    
    // If no practice materials available, keep the review day schedule
    return tasks;
  }
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
  scheduledDate.setHours(0, 0, 0, 0);
  
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
  "AAMC full Length Exam 1",
  "AAMC full Length Exam 2",
  "AAMC full Length Exam 3",
  "AAMC full Length Exam 4",
  "AAMC full Length Exam 5",
  "AAMC full Length Exam 6",
];

