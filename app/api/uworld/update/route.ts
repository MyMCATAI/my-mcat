import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { FetchedActivity } from "@/types";
import { categoryMapping } from "@/constants/categoryMappings";

// Helper function for Thompson sampling
function sampleBeta(alpha: number, beta: number): number {
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  const stdDev = Math.sqrt(variance);
  
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  // Transform to match Beta distribution parameters
  return Math.max(0, Math.min(1, mean + z * stdDev));
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the calendar activity from the request
    const { todayUWorldActivity } = await req.json();
    const firstUWorldActivity = todayUWorldActivity[0];
    if (firstUWorldActivity?.activityTitle !== "UWorld") {
      return NextResponse.json({ error: "Calendar activity is not UWorld" }, { status: 400 });
    }

    // Get number of tasks based on hours allocated
    const hours = firstUWorldActivity.hours;
    const numTasks = Math.floor(hours);

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

    // Get all categories with their knowledge profiles
    const categories = await prisma.category.findMany({
      where: {
        contentCategory: {
          not: "CARS"
        }
      },
      include: {
        knowledgeProfiles: {
          where: { userId }
        }
      }
    });

    // Apply Thompson sampling to each category
    const sampledCategories = categories
      .map(category => {
        const profile = category.knowledgeProfiles[0];
        let sample = 1;
        
        if (profile) {
          const alpha = profile.correctAnswers + 1; // Laplace smoothing
          const beta = (profile.totalAttempts - profile.correctAnswers) + 1;
          sample = sampleBeta(alpha, beta);
        }

        return {
          contentCategory: category.contentCategory,
          sample
        };
      })
      // Sort by sample score (lower is weaker)
      .sort((a, b) => a.sample - b.sample)
      // Take top N weakest based on hours
      .slice(0, numTasks);

    // Create UWorld tasks based on the sampled categories
    const tasks = [
      ...sampledCategories.map((category) => ({
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