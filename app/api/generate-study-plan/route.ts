// app/api/generate-study-plan/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

// Define task categories with their properties
const TASK_CATEGORIES = [
  {
    name: 'Daily CARS Practice',
    optional: true,
    duration: 0.5,
    priority: 2,
  },
  {
    name: 'Adaptive Tutoring Suite',
    optional: true,
    duration: 3,
    chunkable: true,
    chunkSize: 1,
    priority: 2,
    type: 'Content',
  },
  {
    name: 'Anki Clinic',
    optional: true,
    duration: 0.5,
    priority: 2,
    type: 'Content',
  },
  {
    name: 'UWorld',
    duration: 2,
    priority: 3,
    type: 'Review',
  },
  {
    name: 'AAMC Materials',
    duration: 2,
    priority: 3,
    type: 'Review',
  },
  {
    name: 'Full-Length Exam',
    duration: 8,
    priority: 5,
  },
  {
    name: 'Take Up Exam',
    totalDuration: 5,
    chunkable: true,
    chunkSize: 1,
    priority: 4,
  },
];

// Define interfaces for TypeScript
interface StudyPlan {
  id: string;
  userId: string;
  creationDate: Date;
  examDate: Date;
  resources: Resources;
  hoursPerDay: { [key: string]: number };
  fullLengthDays: string[];
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
  conceptMastery: number;
  category: Category;
}

interface Category {
  id: string;
  subjectCategory: string;
}

interface ContentItem {
  id: string;
  title: string;
  minutes_estimate: number;
  type: string;
  link: string;
  categoryId: string;
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
      contentReviewRatio = 0.5,
      useKnowledgeProfile = false,
      alternateStudyPractice = false,
      includeSpecificContent = false,
    } = body;

    if (!examDate || !resources || !hoursPerDay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create or update the study plan
    const studyPlan: StudyPlan = await prisma.studyPlan.upsert({
      where: { userId },
      update: {
        examDate: new Date(examDate),
        resources,
        hoursPerDay,
        fullLengthDays,
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
      includeSpecificContent
    );

    // Save activities to the database
    await prisma.calendarActivity.createMany({
      data: calendarActivities,
    });

    return NextResponse.json({ message: "Study plan generated successfully" }, { status: 201 });
  } catch (error) {
    console.error('Error generating study plan:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Function to generate the study schedule
async function generateStudySchedule(
  studyPlan: StudyPlan,
  resources: Resources,
  hoursPerDay: { [key: string]: number },
  fullLengthDays: string[],
  contentReviewRatio: number,
  knowledgeProfiles: KnowledgeProfile[],
  contentItems: ContentItem[],
  alternateStudyPractice: boolean,
  includeSpecificContent: boolean
): Promise<CalendarActivity[]> {
  const activities: CalendarActivity[] = [];
  const today = new Date();
  const examDate = new Date(studyPlan.examDate);
  const totalDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let currentDate = new Date(today);
  let isStudySession = true;

  // Calculate total available study hours
  const totalStudyHours = calculateTotalAvailableHours(hoursPerDay, studyPlan);

  // Allocate study time per category if using knowledge profiles
  let categoryAllocations: CategoryAllocation[] = [];
  if (knowledgeProfiles.length > 0) {
    categoryAllocations = allocateStudyTime(knowledgeProfiles, totalStudyHours);
  }

  // Select content per category if including specific content items
  let selectedContent: { category: Category; content: SelectedContentItem[] }[] = [];
  if (includeSpecificContent && categoryAllocations.length > 0) {
    selectedContent = selectContent(categoryAllocations, contentItems);
  }

  // Iterate through each day until the exam date
  for (let i = 0; i <= totalDays; i++) {
    const dayOfWeek = currentDate.getDay();
    const dayName = daysOfWeek[dayOfWeek];
    const availableHours = hoursPerDay[dayName] || 0;

    // Skip if no hours are available
    if (availableHours === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    let dailyHours = availableHours;
    const dayActivities: CalendarActivity[] = [];

    // Check if today is a preferred day for full-length exams
    if (fullLengthDays.includes(dayName) && dailyHours >= 8) {
      // Schedule Full-Length Exam
      dayActivities.push(createActivity(studyPlan, 'Full-Length Exam', 'Exam', 8, currentDate));
      dailyHours -= 8;

      // Schedule Take Up Exam on the next available day
      await scheduleTakeUpExam(activities, studyPlan, currentDate, hoursPerDay);
    }

    // Schedule other activities
    while (dailyHours >= 0.5) {
      let activityScheduled = false;

      if (includeSpecificContent && selectedContent.length > 0) {
        // Schedule specific content items
        const contentActivity = getNextContentActivity(selectedContent, currentDate, isStudySession, studyPlan);
        if (contentActivity && contentActivity.hours <= dailyHours) {
          dayActivities.push(contentActivity);
          dailyHours -= contentActivity.hours;
          activityScheduled = true;
        }
      }

      if (!activityScheduled) {
        // Schedule general tasks based on contentReviewRatio
        const mainTaskName = determineMainTask(resources, contentReviewRatio);
        if (mainTaskName) {
          const task = TASK_CATEGORIES.find(t => t.name === mainTaskName);
          const taskDuration = Math.min(task.duration, dailyHours);

          dayActivities.push(createActivity(studyPlan, mainTaskName, task.type || 'Study', taskDuration, currentDate));
          dailyHours -= taskDuration;
          activityScheduled = true;
        }
      }

      if (alternateStudyPractice) {
        isStudySession = !isStudySession;
      }

      if (!activityScheduled) {
        break;
      }
    }

    activities.push(...dayActivities);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return activities;
}

// Function to calculate total available study hours
function calculateTotalAvailableHours(hoursPerDay: { [key: string]: number }, studyPlan: StudyPlan): number {
  const today = new Date();
  const examDate = new Date(studyPlan.examDate);
  const totalDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let totalHours = 0;
  let currentDate = new Date(today);

  for (let i = 0; i <= totalDays; i++) {
    const dayOfWeek = currentDate.getDay();
    const dayName = daysOfWeek[dayOfWeek];
    totalHours += hoursPerDay[dayName] || 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return totalHours;
}

// Function to allocate study time based on knowledge profiles
function allocateStudyTime(knowledgeProfiles: KnowledgeProfile[], totalStudyHours: number): CategoryAllocation[] {
  const totalMastery = knowledgeProfiles.reduce((sum, profile) => sum + (1 - profile.conceptMastery), 0);
  return knowledgeProfiles.map(profile => ({
    ...profile,
    allocatedHours: totalStudyHours * ((1 - profile.conceptMastery) / totalMastery),
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

      return {
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
      };
    }
  }
  return null;
}

// Function to schedule Take Up Exam sessions
async function scheduleTakeUpExam(
  activities: CalendarActivity[],
  studyPlan: StudyPlan,
  examDate: Date,
  hoursPerDay: { [key: string]: number }
) {
  let remainingReviewHours = 5;
  let currentDate = new Date(examDate);
  currentDate.setDate(currentDate.getDate() + 1);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  while (remainingReviewHours > 0) {
    const dayOfWeek = currentDate.getDay();
    const dayName = daysOfWeek[dayOfWeek];
    const availableHours = hoursPerDay[dayName] || 0;

    if (availableHours > 0) {
      const reviewHours = Math.min(availableHours, remainingReviewHours);
      activities.push(createActivity(studyPlan, 'Take Up Exam', 'Review', reviewHours, currentDate));
      remainingReviewHours -= reviewHours;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
}

// Function to determine the main task based on contentReviewRatio
function determineMainTask(resources: Resources, contentReviewRatio: number): string | null {
  const contentTasks: string[] = [];
  const reviewTasks: string[] = [];

  if (resources.hasAdaptiveTutoringSuite) {
    contentTasks.push('Adaptive Tutoring Suite');
  }
  if (resources.hasAnki) {
    contentTasks.push('Anki Clinic');
  }
  if (resources.hasUWorld) {
    reviewTasks.push('UWorld');
  }
  if (resources.hasAAMC) {
    reviewTasks.push('AAMC Materials');
  }

  const rand = Math.random();

  if (rand < contentReviewRatio && reviewTasks.length > 0) {
    return reviewTasks[Math.floor(Math.random() * reviewTasks.length)];
  } else if (contentTasks.length > 0) {
    return contentTasks[Math.floor(Math.random() * contentTasks.length)];
  } else if (reviewTasks.length > 0) {
    return reviewTasks[Math.floor(Math.random() * reviewTasks.length)];
  } else {
    return null;
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
  return {
    userId: studyPlan.userId,
    studyPlanId: studyPlan.id,
    categoryId: null,
    contentId: null,
    activityText: `Work on ${name}`,
    activityTitle: name,
    hours: duration,
    activityType: type,
    link: '',
    scheduledDate: new Date(date),
    status: "Not Started",
  };
}
