'use server';

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get all full length exams for the user, including their data pulses and calendar activities
    const fullLengthExams = await prisma.fullLengthExam.findMany({
      where: {
        userId,
      },
      include: {
        dataPulses: true,
        calendarActivity: {
          select: {
            scheduledDate: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json(fullLengthExams);
  } catch (error) {
    console.error("[FULL_LENGTH_EXAM_GET]", error);
    return new Response("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      calendarActivityId,
      title,
      scores: { cp, cars, bb, ps }
    } = body;

    // Validate that we have a calendar activity
    if (!calendarActivityId) {
      return new Response("Calendar Activity ID is required", { status: 400 });
    }

    // Verify the calendar activity exists and belongs to the user
    const calendarActivity = await prisma.calendarActivity.findUnique({
      where: {
        id: calendarActivityId,
        userId,
      }
    });

    if (!calendarActivity) {
      return new Response("Calendar Activity not found", { status: 404 });
    }

    // Create the FullLengthExam record
    const fullLengthExam = await prisma.fullLengthExam.create({
      data: {
        userId,
        title,
        calendarActivityId,
        // Create DataPulses for each section
        dataPulses: {
          create: [
            {
              userId,
              name: "Chemical and Physical Foundations",
              level: "section",
              section: "C/P",
              source: "full_length_exam",
              positive: cp,
              weight: 1,
            },
            {
              userId,
              name: "Critical Analysis and Reasoning",
              level: "section",
              source: "full_length_exam",
              section: "CARs",
              positive: cars,
              weight: 1,
            },
            {
              userId,
              name: "Biological and Biochemical Foundations",
              level: "section",
              source: "full_length_exam",
              section: "B/B",
              positive: bb,
              weight: 1,
            },
            {
              userId,
              name: "Psychological, Social, and Biological Foundations",
              level: "section",
              source: "full_length_exam",
              section: "P/S",
              positive: ps,
              weight: 1,
            }
          ]
        }
      },
      include: {
        dataPulses: true,
        calendarActivity: {
          select: {
            scheduledDate: true,
            status: true,
          }
        }
      }
    });

    // Update calendar activity status in the same transaction
    await prisma.calendarActivity.update({
      where: { id: calendarActivityId },
      data: { 
        status: "Completed",
        fullLengthExam: {
          connect: {
            id: fullLengthExam.id
          }
        }
      }
    });

    return Response.json(fullLengthExam);
  } catch (error) {
    console.error("[FULL_LENGTH_EXAM_COMPLETE]", error);
    return new Response("Internal Error", { status: 500 });
  }
} 