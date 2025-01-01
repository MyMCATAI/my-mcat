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
      fullLengthDays as string[],
      new Date()
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
  startDate: Date
): Promise<CalendarActivity[]> {
  const activities: CalendarActivity[] = [];
  const examDate = new Date(studyPlan.examDate);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MINIMUM_DAYS_BETWEEN_EXAMS = 5;

  // Ensure dates are at start of day
  startDate.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);

  const availableExams = [
    "AAMC Unscored Sample",  // Always first
    "AAMC Full Length Exam 1",
    "AAMC Full Length Exam 2",
    "AAMC Full Length Exam 3",
    "AAMC Full Length Exam 4",
    "AAMC Sample Scored (FL5)"  // Always last
  ];
  let examSchedule: { date: Date; examName: string }[] = [];

  // Helper function to check if a date has enough spacing from existing exams
  function hasEnoughSpacing(date: Date, schedule: { date: Date; examName: string }[]): boolean {
    return schedule.every(exam => {
      const daysBetween = Math.abs(
        Math.floor((date.getTime() - exam.date.getTime()) / (1000 * 60 * 60 * 24))
      );
      return daysBetween >= MINIMUM_DAYS_BETWEEN_EXAMS;
    });
  }

  // Helper function to find next valid date
  function findNextValidDate(startFrom: Date, schedule: { date: Date; examName: string }[]): Date | null {
    let currentDate = new Date(startFrom);
    let attempts = 0;
    const maxAttempts = 30; // Prevent infinite loop

    while (attempts < maxAttempts) {
      if (
        fullLengthDays.includes(daysOfWeek[currentDate.getDay()]) &&
        hasEnoughSpacing(currentDate, schedule)
      ) {
        return new Date(currentDate);
      }
      currentDate.setDate(currentDate.getDate() + 1);
      attempts++;
    }
    return null;
  }
  
  if (fullLengthDays.length > 0) {
    // Schedule Unscored Sample on first available day
    const firstValidDate = findNextValidDate(startDate, examSchedule);
    if (firstValidDate) {
      examSchedule.push({
        date: firstValidDate,
        examName: availableExams[0] // Unscored Sample
      });
    }

    // Schedule FL5 on last possible day (at least 4 days before exam)
    let lastExamDate = new Date(examDate);
    lastExamDate.setDate(lastExamDate.getDate() - MINIMUM_DAYS_BETWEEN_EXAMS);
    
    // Start from the exam date and work backwards to find the latest valid date
    let latestValidDate = null;
    let currentDate = new Date(examDate);
    currentDate.setDate(currentDate.getDate() - MINIMUM_DAYS_BETWEEN_EXAMS); // Start at least 4 days before

    while (!latestValidDate && currentDate > firstValidDate!) {
      if (fullLengthDays.includes(daysOfWeek[currentDate.getDay()]) && 
          hasEnoughSpacing(currentDate, examSchedule)) {
        latestValidDate = new Date(currentDate);
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }

    if (latestValidDate) {
      examSchedule.push({
        date: latestValidDate,
        examName: availableExams[5] // FL5
      });

      // Calculate available days between first and last exam
      const daysAvailable = Math.floor(
        (latestValidDate.getTime() - firstValidDate!.getTime()) / (1000 * 3600 * 24)
      );

      // If we have enough days, try to fit FL4 through FL1 in reverse order
      if (daysAvailable >= MINIMUM_DAYS_BETWEEN_EXAMS * 2) {
        const remainingExams = ["AAMC Full Length Exam 4", "AAMC Full Length Exam 3", "AAMC Full Length Exam 2", "AAMC Full Length Exam 1"];
        let currentDate = new Date(latestValidDate);
        
        for (const exam of remainingExams) {
          currentDate.setDate(currentDate.getDate() - MINIMUM_DAYS_BETWEEN_EXAMS);
          const nextValidDate = findNextValidDate(currentDate, examSchedule);

          if (nextValidDate && 
              nextValidDate > firstValidDate! && 
              nextValidDate < latestValidDate) {
            examSchedule.push({
              date: nextValidDate,
              examName: exam
            });
            currentDate = new Date(nextValidDate);
          } else {
            break; // Stop if we can't fit more exams
          }
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

