import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

function sampleBeta(alpha: number, beta: number): number {
  // Simple approximation of beta sampling using normal distribution
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  const stdDev = Math.sqrt(variance);
  
  // Box-Muller transform for normal distribution
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
    const { section, excludeIds = [], selectionType = 'questions' } = await req.json();

    // Get knowledge profiles for the user
    const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
      where: {
        userId,
        ...(section !== 'all' && {
          category: {
            section: section
          }
        })
      },
      include: {
        category: true
      }
    });

    // Calculate Thompson sampling parameters for each category
    const categoryScores = knowledgeProfiles.map(profile => {
      // Calculate alpha and beta from correct/incorrect answers
      const alpha = profile.correctAnswers + 1; // Add 1 for Laplace smoothing
      const beta = (profile.totalAttempts - profile.correctAnswers) + 1;
      
      // Sample from beta distribution
      const sample = sampleBeta(alpha, beta);
      
      return {
        categoryId: profile.categoryId,
        sample,
        category: profile.category
      };
    });

    // Sort by sample value (ascending - we want to focus on categories with lower mastery)
    categoryScores.sort((a, b) => a.sample - b.sample);

    // If we're just selecting rooms, return the categories
    if (selectionType === 'rooms') {
      return NextResponse.json({ 
        selectedCategories: categoryScores.slice(0, 3).map(score => score.category)
      });
    }

    // Otherwise, proceed with question selection
    const questions = await prisma.question.findMany({
      where: {
        categoryId: {
          in: categoryScores.slice(0, 3).map(score => score.categoryId)
        },
        id: {
          notIn: excludeIds
        }
      },
      take: 5,
      orderBy: {
        difficulty: 'asc'
      }
    });

    // If no questions found, try getting any questions from the section
    if (questions.length === 0) {
      const fallbackQuestions = await prisma.question.findMany({
        where: {
          category: {
            section: section
          },
          id: {
            notIn: excludeIds
          }
        },
        take: 5,
        orderBy: {
          difficulty: 'asc'
        }
      });
      
      return NextResponse.json({ 
        questions: fallbackQuestions,
        selectedCategories: categoryScores.slice(0, 3).map(score => score.category)
      });
    }

    return NextResponse.json({ 
      questions,
      selectedCategories: categoryScores.slice(0, 3).map(score => score.category)
    });

  } catch (error) {
    console.error('Error selecting questions:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 