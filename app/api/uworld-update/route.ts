import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { FetchedActivity } from "@/types";
import { categoryMapping } from "@/constants/categoryMappings";

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

    // Filter activities that need task generation
    const activitiesNeedingTasks = todayUWorldActivity.filter((activity: FetchedActivity) => 
      !activity.tasks || 
      (activity.tasks.length === 1)
    );

    // If no activities need tasks, return early
    if (activitiesNeedingTasks.length === 0) {
      return NextResponse.json({ 
        message: "No UWorld activities need task generation",
        tasks: [] 
      }, { status: 200 });
    }

    const calendarActivityIds = activitiesNeedingTasks.map((activity: FetchedActivity) => activity.id);

    // Define the type for our query result
    type MasteryCategory = {
      contentCategory: string;
      averageMastery: number;
    }

    // Get the 3 content categories with lowest average content mastery
    const lowestMasteryCategories = await prisma.$queryRaw<MasteryCategory[]>`
      SELECT 
        c.contentCategory,
        AVG(kp.contentMastery) as averageMastery
      FROM KnowledgeProfile kp
      JOIN Category c ON kp.categoryId = c.id
      WHERE kp.userId = ${userId}
        AND kp.contentMastery IS NOT NULL
        AND LOWER(c.contentCategory) != 'cars'
      GROUP BY c.contentCategory
      ORDER BY averageMastery ASC
      LIMIT 3
    `;

    // Create UWorld tasks based on the unique content categories
    const tasks = [
      ...lowestMasteryCategories.map((category) => ({
        text: `12 Q UWorld - ${categoryMapping[category.contentCategory] || category.contentCategory}`,
        completed: false
      })),
      {
        text: "Review UWorld",
        completed: false
      }
    ];

    // Update only the calendar activities that need new tasks
    const updatedActivity = await prisma.calendarActivity.updateMany({
      where: {
        id: { in: calendarActivityIds }
      },
      data: {
        tasks: tasks
      }
    });

    return NextResponse.json({ 
      message: "UWorld tasks updated successfully",
      tasks: tasks 
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating UWorld tasks:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
