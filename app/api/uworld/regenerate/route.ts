import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { uworldMapping } from "@/constants/uworld";
import { UWorldTask, UWorldTopic } from "@/components/uworld/types";

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

    // Track selected topics to prevent duplicates
    const selectedTopics = new Set<UWorldTopic>();

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
      .sort(() => Math.random() - 0.5) // Shuffle
      .sort((a, b) => a.sample - b.sample) // Sort by performance (lower is weaker)
      .slice(0, numTasks);

    // Create UWorld tasks based on the sampled categories
    const tasks: UWorldTask[] = [];

    for (const category of sampledCategories) {
      // Find all UWorld topics that map to this MyMCAT category
      const availableTopics = Object.entries(uworldMapping)
        .filter(([_, subjects]) => subjects.includes(category.contentCategory))
        .map(([topic]) => topic as UWorldTopic)
        .filter(topic => !selectedTopics.has(topic));

      if (availableTopics.length > 0) {
        // Randomly select one available topic
        const selectedTopic = availableTopics[
          Math.floor(Math.random() * availableTopics.length)
        ];

        selectedTopics.add(selectedTopic);

        tasks.push({
          text: `12 Q UWorld - ${String(selectedTopic)}`,
          subject: String(selectedTopic),
          completed: false,
          correctAnswers: 0,
          incorrectAnswers: 0
        });
      }
    }

    return NextResponse.json({
      message: "UWorld tasks regenerated successfully",
      tasks
    }, { status: 200 });

  } catch (error) {
    console.error('Error regenerating UWorld tasks:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 