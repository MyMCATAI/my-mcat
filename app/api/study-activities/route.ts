import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');

    let activities;

    if (examId) {
      // Get the current exam
      const currentExam = await prisma.calendarActivity.findUnique({
        where: { id: examId }
      });

      if (!currentExam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      // Get the next exam
      const nextExam = await prisma.calendarActivity.findFirst({
        where: {
          userId,
          activityType: 'Exam',
          scheduledDate: {
            gt: currentExam.scheduledDate
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        }
      });

      // Get activities between current exam and next exam (or just after current exam if no next exam)
      activities = await prisma.calendarActivity.findMany({
        where: {
          userId,
          activityType: {
            not: 'Exam'
          },
          scheduledDate: {
            gte: currentExam.scheduledDate,
            ...(nextExam && { lt: nextExam.scheduledDate })
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        }
      });
    } else {
      // Get the next upcoming exam
      const nextExam = await prisma.calendarActivity.findFirst({
        where: {
          userId,
          activityType: 'Exam',
          scheduledDate: {
            gt: new Date()
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        }
      });

      // Get activities until the next exam
      activities = await prisma.calendarActivity.findMany({
        where: {
          userId,
          activityType: {
            not: 'Exam'
          },
          scheduledDate: {
            gte: new Date(),
            ...(nextExam && { lt: nextExam.scheduledDate })
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        }
      });
    }

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching study activities:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { activityId, status } = body;

    const updatedActivity = await prisma.calendarActivity.update({
      where: {
        id: activityId,
        userId
      },
      data: { status }
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error('Error updating study activity:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 