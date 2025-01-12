'use server';

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface CreateExamActivityBody {
  activityTitle: string;
  activityText: string;
  scheduledDate: string;
  hours: number;
}

// Helper function to ensure consistent date handling
function parseAndFormatDate(dateString: string): Date {
  // Parse the incoming date string to local date
  const localDate = new Date(dateString);
  
  // Create a date at noon UTC on the same day
  const utcDate = new Date(Date.UTC(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    12, // noon UTC
    0,
    0,
    0
  ));
  
  return utcDate;
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get all exam calendar activities and their associated full length exams
    const examActivities = await prisma.calendarActivity.findMany({
      where: {
        userId,
        activityType: "Exam",
      },
      include: {
        fullLengthExam: {
          include: {
            dataPulses: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    return Response.json(examActivities);
  } catch (error) {
    console.error("[EXAM_ACTIVITIES_GET]", error);
    return new Response("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Find the user's study plan first
    const existingPlan = await prisma.studyPlan.findFirst({
      where: { userId },
    });

    if (!existingPlan) {
      return new Response("No study plan found for user", { status: 404 });
    }

    const body = await req.json();
    const { activityTitle, activityText, scheduledDate, hours }: CreateExamActivityBody = body;

    if (!activityTitle || !activityText || !scheduledDate) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Create new exam activity with the found study plan ID
    const newActivity = await prisma.calendarActivity.create({
      data: {
        userId,
        studyPlanId: existingPlan.id,
        activityTitle,
        activityText,
        activityType: "Exam",
        scheduledDate: parseAndFormatDate(scheduledDate),
        hours: hours || 8,
        status: "Not Started",
      },
      include: {
        fullLengthExam: {
          include: {
            dataPulses: true
          }
        }
      }
    });

    return Response.json(newActivity);
  } catch (error) {
    console.error("[EXAM_ACTIVITIES_POST]", error);
    return new Response("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, scheduledDate } = body;

    if (!id || !scheduledDate) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Update the exam activity
    const updatedActivity = await prisma.calendarActivity.update({
      where: {
        id,
        userId,
      },
      data: {
        scheduledDate: parseAndFormatDate(scheduledDate),
      },
      include: {
        fullLengthExam: {
          include: {
            dataPulses: true
          }
        }
      }
    });

    return Response.json(updatedActivity);
  } catch (error) {
    console.error("[EXAM_ACTIVITIES_PUT]", error);
    return new Response("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response("Missing exam activity ID", { status: 400 });
    }

    // Delete the exam activity
    await prisma.calendarActivity.delete({
      where: {
        id,
        userId, // Ensure the activity belongs to the user
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[EXAM_ACTIVITIES_DELETE]", error);
    return new Response("Internal Error", { status: 500 });
  }
} 