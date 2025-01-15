import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { categoryMapping } from "@/constants/categoryMappings";

// Helper function for Thompson sampling
function sampleBeta(alpha: number, beta: number): number {
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  const stdDev = Math.sqrt(variance);
  
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  return Math.max(0, Math.min(1, mean + z * stdDev));
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get hours from request body
    const { hours = 1 } = await req.json();
    const numTasks = Math.floor(hours);

    // Get all categories with their knowledge profiles
    const categories = await prisma.category.findMany({
      where: {
        NOT: {
          contentCategory: {
            equals: 'CARS'
          }
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
        let sample = Math.random() * 0.3; // Base randomness
        
        if (profile) {
          const alpha = profile.correctAnswers + 1;
          const beta = (profile.totalAttempts - profile.correctAnswers) + 1;
          // Blend random chance with performance
          sample = (sampleBeta(alpha, beta) * 0.7) + (Math.random() * 0.3);
        }

        return {
          contentCategory: category.contentCategory,
          sample
        };
      })
      // Shuffle before sorting to break ties randomly
      .sort(() => Math.random() - 0.5)
      // Sort by sample score (lower is weaker)
      .sort((a, b) => a.sample - b.sample)
      // Take N tasks based on hours
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

    return NextResponse.json({ 
      message: "UWorld tasks regenerated successfully",
      tasks: tasks 
    }, { status: 200 });

  } catch (error) {
    console.error('Error regenerating UWorld tasks:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 