export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { format, addDays } from 'date-fns';

const MINIMUM_DAYS_BETWEEN_EXAMS = 5;

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's study plan to check full length days
    const studyPlan = await prisma.studyPlan.findFirst({
      where: { userId }
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "No study plan found" }, { status: 404 });
    }

    const fullLengthDays = studyPlan.fullLengthDays as string[];
    if (!fullLengthDays || fullLengthDays.length === 0) {
      return NextResponse.json({ error: "No full length days set in study plan" }, { status: 400 });
    }

    // Get all existing exam dates
    const existingExams = await prisma.calendarActivity.findMany({
      where: {
        userId,
        activityType: 'Exam',
        scheduledDate: {
          gte: new Date() // Only look at future exams
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Keep checking dates until we find a valid one
    while (true) {
      const dayName = format(currentDate, 'EEEE'); // Gets day name (Monday, Tuesday, etc.)
      
      // Check if this is a selected full-length exam day
      if (fullLengthDays.includes(dayName)) {
        // Check if this date maintains minimum spacing from all existing exams
        const hasConflict = existingExams.some(exam => {
          const daysBetween = Math.abs(
            Math.floor((currentDate.getTime() - new Date(exam.scheduledDate).getTime()) / (1000 * 60 * 60 * 24))
          );
          return daysBetween < MINIMUM_DAYS_BETWEEN_EXAMS;
        });

        if (!hasConflict) {
          return NextResponse.json({ date: currentDate });
        }
      }
      
      // Try next day
      currentDate = addDays(currentDate, 1);

      // Safety check to prevent infinite loop
      if (addDays(currentDate, 0).getTime() - new Date().getTime() > 365 * 24 * 60 * 60 * 1000) {
        return NextResponse.json({ error: "No available dates found within the next year" }, { status: 404 });
      }
    }
  } catch (error) {
    console.error('Error finding next available test date:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 