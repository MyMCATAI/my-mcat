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
  const INITIAL_BUFFER_DAYS = 3; // Buffer before first exam

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

  // Helper function to get all valid exam dates between two dates
  function getValidDates(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    let current = new Date(start);
    while (current <= end) {
      if (fullLengthDays.includes(daysOfWeek[current.getDay()])) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  // Helper function to find nearest valid date to a target date
  function findNearestValidDate(targetDate: Date, validDates: Date[]): Date | null {
    if (validDates.length === 0) return null;
    
    return validDates.reduce((nearest, date) => {
      const currentDiff = Math.abs(date.getTime() - targetDate.getTime());
      const nearestDiff = Math.abs(nearest.getTime() - targetDate.getTime());
      return currentDiff < nearestDiff ? date : nearest;
    });
  }

  let examSchedule: { date: Date; examName: string }[] = [];

  // Helper function to get all valid exam dates between two dates
  function getValidDates(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    let current = new Date(start);
    while (current <= end) {
      if (fullLengthDays.includes(daysOfWeek[current.getDay()])) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  // Helper function to find nearest valid date to a target date
  function findNearestValidDate(targetDate: Date, validDates: Date[]): Date | null {
    if (validDates.length === 0) return null;
    
    return validDates.reduce((nearest, date) => {
      const currentDiff = Math.abs(date.getTime() - targetDate.getTime());
      const nearestDiff = Math.abs(nearest.getTime() - targetDate.getTime());
      return currentDiff < nearestDiff ? date : nearest;
    });
  }

  let examSchedule: { date: Date; examName: string }[] = [];
  
  if (fullLengthDays.length > 0) {
    // Calculate study period boundaries
    let firstPossibleDate = new Date(startDate);
    firstPossibleDate.setDate(firstPossibleDate.getDate() + INITIAL_BUFFER_DAYS);
    
    let lastPossibleDate = new Date(examDate);
    lastPossibleDate.setDate(lastPossibleDate.getDate() - MINIMUM_DAYS_BETWEEN_EXAMS);

    // Get all valid dates in the study period
    const validDates = getValidDates(firstPossibleDate, lastPossibleDate);

    if (validDates.length === 0) {
      return activities; // No valid dates available
    }

    // Schedule Unscored Sample near start
    const firstExamDate = validDates[0];
    examSchedule.push({
      date: firstExamDate,
      examName: availableExams[0]
    });

    // Schedule FL5 near end
    const lastExamDate = validDates[validDates.length - 1];
    examSchedule.push({
      date: lastExamDate,
      examName: availableExams[5]
    });

    // Calculate ideal spacing for remaining exams
    const totalDays = Math.floor((lastExamDate.getTime() - firstExamDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingExams = [
      "AAMC Full Length Exam 1",
      "AAMC Full Length Exam 2", 
      "AAMC Full Length Exam 3", 
      "AAMC Full Length Exam 4"
    ]; // Changed order to be sequential

    if (totalDays >= MINIMUM_DAYS_BETWEEN_EXAMS * 2) {
      // Calculate spacing to distribute exams evenly
      const numberOfGaps = remainingExams.length + 1; // gaps between all exams including first and last
      const idealSpacing = Math.max(MINIMUM_DAYS_BETWEEN_EXAMS, Math.floor(totalDays / numberOfGaps));
      
      let currentDate = new Date(firstExamDate);
      let lastScheduledDate = new Date(firstExamDate);
      
      for (const exam of remainingExams) {
        // Calculate ideal date for this exam
        currentDate = new Date(lastScheduledDate);
        currentDate.setDate(currentDate.getDate() + idealSpacing);
        
        // Find nearest valid date that maintains minimum spacing
        const validDatesForExam = validDates.filter(date => {
          // Must be after last scheduled exam + minimum days
          const minDate = new Date(lastScheduledDate);
          minDate.setDate(minDate.getDate() + MINIMUM_DAYS_BETWEEN_EXAMS);
          if (date < minDate) return false;

          // Must maintain spacing from all scheduled exams
          return examSchedule.every(scheduled => {
            const daysBetween = Math.abs(
              Math.floor((date.getTime() - scheduled.date.getTime()) / (1000 * 60 * 60 * 24))
            );
            return daysBetween >= MINIMUM_DAYS_BETWEEN_EXAMS;
          });
        });

        const nearestDate = findNearestValidDate(currentDate, validDatesForExam);
        if (nearestDate && 
            nearestDate > firstExamDate && 
            nearestDate < lastExamDate) {
          examSchedule.push({
            date: nearestDate,
            examName: exam
          });
          lastScheduledDate = new Date(nearestDate);
          
          // Log the scheduled exam
          console.log(`Scheduled ${exam} for ${nearestDate.toISOString().split('T')[0]}`);
        } else {
          console.log(`Could not schedule ${exam} - no valid dates available`);
          break; // Stop if we can't fit more exams
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

