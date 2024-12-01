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

    // Add content category mapping
    const categoryMapping: Record<string, string> = {
      "1A": "Amino Acids",
      "1B": "Molecular Biology",
      "1C": "Genetics",
      "1D": "Metabolism",
      "2A": "Cell Biology",
      "2B": "Cell Biology",
      "2C": "Reproduction",
      "3A": "Musculoskeletal, Endocrine, Nervous",
      "3B": "Circulation + Respiration",
      "4A": "Mechanics and Energy",
      "4B": "Fluids & Gases",
      "4C": "Circuits",
      "4D": "Light and Sound",
      "4E": "Atomic Theory",
      "5A": "Solutions and Electrochemistry",
      "5B": "Interactions of Chem Substances",
      "5C": "Lab Techniques",
      "5D": "Organic Chemistry",
      "5E": "Thermochem, Kinetics, Eq (15Q)",
      "6A": "Sensation, Perception, Consciousness",
      "6B": "Sensation, Perception, Consciousness",
      "6C": "Sensation, Perception, Consciousness",
      "7A": "Motivations, Attitude, Personality",
      "7B": "Learning, Memory, and Cognition",
      "7C": "Learning, Memory, and Cognition",
      "8A": "Identity and Social Interactions",
      "8B": "Identity and Social Interactions",
      "8C": "Identity and Social Interactions",
      "9A": "Dem. and Social Structure",
      "9B": "Dem. and Social Structure",
      "10A": "Dem. and Social Structure"
    };

    // Create UWorld tasks based on the unique content categories
    const tasks = [
      ...lowestMasteryCategories.map((category) => ({
        text: `15 Q UWorld - ${categoryMapping[category.contentCategory] || category.contentCategory}`,
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
