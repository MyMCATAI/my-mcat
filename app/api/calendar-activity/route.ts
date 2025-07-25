// app/api/calendar-activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { Prisma } from '@prisma/client';;

export async function POST(req: NextRequest) {

  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  
    // First, check if a CalendarActivity exists for this user
    const existingPlan = await prisma.studyPlan.findFirst({
      where: { userId },
    });


    if (!existingPlan) {
      return NextResponse.json({ error: "No existing Calendar Activity found for this user" }, { status: 405 });
    }

    const body = await req.json();
    const { categoryId, activityText, activityTitle, hours, activityType, link, scheduledDate, tasks } = body;

    const missingFields = [];
    if (!activityText) missingFields.push("activityText");
    if (!activityTitle) missingFields.push("activityTitle");
    if (!hours) missingFields.push("hours");
    if (!scheduledDate) missingFields.push("scheduledDate");
    if (!activityType) missingFields.push("activityType");

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 });
    }

    const activity = await prisma.calendarActivity.create({
      data: {
        userId,
        studyPlanId: existingPlan.id,
        categoryId,
        activityText,
        activityTitle,
        hours: parseFloat(hours),
        activityType,
        link,
        status: "Not Started",
        scheduledDate: new Date(scheduledDate),
        tasks: tasks || [],
        source: "user",
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar activity:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await prisma.calendarActivity.findMany({
      where: { userId },
      orderBy: { scheduledDate: 'asc' },
      select: {
        id: true,
        scheduledDate: true,
        activityTitle: true,
        activityText: true,
        hours: true,
        status: true,
        link: true,
        activityType: true,
        tasks: true,
        source: true,
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching calendar activities:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, scheduledDate, activityTitle, activityText, hours, status, activityType, link, tasks } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing activity id" }, { status: 400 });
    }

    // Prepare update data with proper type casting for tasks
    const updateData: Prisma.CalendarActivityUpdateInput = {};
    
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (activityTitle) updateData.activityTitle = activityTitle;
    if (activityText) updateData.activityText = activityText;
    if (hours) updateData.hours = parseFloat(hours);
    if (status) updateData.status = status;
    if (activityType) updateData.activityType = activityType;
    if (link) updateData.link = link;
    if (tasks) {
      updateData.tasks = tasks as Prisma.InputJsonValue;
      
      // Check if there are tasks and all are completed
      const allTasksCompleted = tasks.length > 0 && tasks.every((task: { completed: boolean; }) => task.completed);
      if (allTasksCompleted) {
        updateData.status = "Complete";
      }
    }

    const updatedActivity = await prisma.calendarActivity.update({
      where: { id: id, userId: userId },
      data: updateData,
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error('Error updating calendar activity:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing activity id" }, { status: 400 });
    }

    const deletedActivity = await prisma.calendarActivity.delete({
      where: { id: id, userId: userId },
    });

    return NextResponse.json(deletedActivity);
  } catch (error) {
    console.error('Error deleting calendar activity:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}