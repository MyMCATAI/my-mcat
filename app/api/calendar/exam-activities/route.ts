'use server';

import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

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