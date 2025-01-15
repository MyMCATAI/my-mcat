'use server';

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      calendarActivityId,
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
      },
      include: {
        fullLengthExam: true
      }
    });

    if (!calendarActivity) {
      return new Response("Calendar Activity not found", { status: 404 });
    }

    if (!calendarActivity.fullLengthExam) {
      return new Response("No full length exam found for this activity", { status: 404 });
    }

    // Update the DataPulses for each section
    await prisma.$transaction([
      prisma.dataPulse.updateMany({
        where: {
          fullLengthExamId: calendarActivity.fullLengthExam.id,
          name: "Chemical and Physical Foundations",
          level: "section"
        },
        data: { positive: cp }
      }),
      prisma.dataPulse.updateMany({
        where: {
          fullLengthExamId: calendarActivity.fullLengthExam.id,
          name: "Critical Analysis and Reasoning",
          level: "section"
        },
        data: { positive: cars }
      }),
      prisma.dataPulse.updateMany({
        where: {
          fullLengthExamId: calendarActivity.fullLengthExam.id,
          name: "Biological and Biochemical Foundations",
          level: "section"
        },
        data: { positive: bb }
      }),
      prisma.dataPulse.updateMany({
        where: {
          fullLengthExamId: calendarActivity.fullLengthExam.id,
          name: "Psychological, Social, and Biological Foundations",
          level: "section"
        },
        data: { positive: ps }
      })
    ]);

    // Get the updated exam with all its data
    const updatedExam = await prisma.fullLengthExam.findUnique({
      where: { id: calendarActivity.fullLengthExam.id },
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

    return Response.json(updatedExam);
  } catch (error) {
    console.error("[FULL_LENGTH_EXAM_UPDATE]", error);
    return new Response("Internal Error", { status: 500 });
  }
} 