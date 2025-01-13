import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

interface ReplacementData {
  eventId: string;
  taskType: string;
  replacementScope: 'single' | 'future';
}

// Helper function to get default tasks for an event type
async function getDefaultTasks(eventTitle: string) {
  try {
    // Instead of making an HTTP request, directly read from the CSV file
    const { parseDefaultTasks } = await import('@/lib/utils');
    const { promises: fs } = await import('fs');
    const path = await import('path');
    
    const csvPath = path.join(process.cwd(), 'app', 'api', 'event-task', 'taskList.csv');
    const csvContent = await fs.readFile(csvPath, 'utf8');
    const taskMapping = parseDefaultTasks(csvContent);
    
    return taskMapping[eventTitle] || [];
  } catch (error) {
    console.error('Error getting default tasks:', error);
    return [];
  }
}

// Helper function to get event duration based on type
function getEventDuration(eventType: string) {
  const EVENT_CATEGORIES = [
    { name: 'MyMCAT Daily CARs', duration: 0.5 },
    { name: 'AAMC CARs', duration: 0.5 },
    { name: 'Adaptive Tutoring Suite', duration: 1 },
    { name: 'Anki Clinic', duration: 0.5 },
    { name: 'Regular Anki', duration: 0.5 },
    { name: 'UWorld', duration: 1 },
    { name: 'AAMC Materials', duration: 2 }
  ];

  const category = EVENT_CATEGORIES.find(cat => cat.name === eventType);
  return category?.duration || 1;
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ReplacementData = await req.json();
    const { eventId, taskType, replacementScope } = body;

    // Get the original event
    const originalEvent = await prisma.calendarActivity.findUnique({
      where: { id: eventId }
    });

    if (!originalEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get default tasks for the new event type
    const defaultTasks = await getDefaultTasks(taskType);
    const duration = getEventDuration(taskType);

    // Prepare the update data
    const updateData = {
      activityTitle: taskType,
      activityText: `Generated ${taskType} activity`,
      hours: duration,
      activityType: taskType.toLowerCase().includes('cars') ? 'Practice' : 
                   taskType.includes('Anki') ? 'Review' : 
                   'Practice',
      tasks: defaultTasks,
      source: 'generated'
    };

    if (replacementScope === 'single') {
      // Update only the selected event
      await prisma.calendarActivity.update({
        where: { id: eventId },
        data: updateData
      });
    } else {
      // Update this and all future events with the same title
      const currentDate = originalEvent.scheduledDate;
      
      await prisma.calendarActivity.updateMany({
        where: {
          userId,
          activityTitle: originalEvent.activityTitle,
          scheduledDate: {
            gte: currentDate
          }
        },
        data: updateData
      });
    }

    return NextResponse.json({ message: "Event(s) replaced successfully" });

  } catch (error) {
    console.error('[CALENDAR_ACTIVITY_REPLACE]', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 