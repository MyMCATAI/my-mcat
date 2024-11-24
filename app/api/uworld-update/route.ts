import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { FetchedActivity } from "@/types";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the calendar activity ID from the request
    const { todayUWorldActivity } = await req.json();
    const firstUWorldActivity = todayUWorldActivity[0];
    if (firstUWorldActivity?.activityTitle !== "UWorld") {
      return NextResponse.json({ error: "Calendar activity is not UWorld" }, { status: 400 });
    }

    const calendarActivityIds = todayUWorldActivity.map((activity: FetchedActivity) => activity.id);

    // Get the 3 categories with lowest concept mastery
    const lowestMasteryCategories = await prisma.knowledgeProfile.findMany({
      where: {
        userId: userId,
        conceptMastery: { not: null }
      },
      orderBy: {
        conceptMastery: 'asc'
      },
      take: 3,
      include: {
        category: true
      }
    });

    // Create UWorld tasks based on the categories
    const tasks = lowestMasteryCategories.map(profile => ({
      text: `UWorld study ${profile.category.contentCategory} ${profile.category.conceptCategory}`,
      completed: false
    }));

    // Update the calendar activity with the new tasks
    const updatedActivity = await prisma.calendarActivity.updateMany({
      where: {
        id: { in: calendarActivityIds }
      },
      data: {
        tasks: tasks
      }
    });

    console.log("UWorld tasks updated successfully", tasks);
    return NextResponse.json({ 
      message: "UWorld tasks updated successfully",
      tasks: tasks 
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating UWorld tasks:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
