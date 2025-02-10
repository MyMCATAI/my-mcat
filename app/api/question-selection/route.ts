//app/api/question-selection/route.ts

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

    // Calculate Thompson sampling parameters with added randomness
    const categoryScores = knowledgeProfiles.map(profile => {
      let sample = Math.random() * 0.2; // Base randomness (20%)
      
      // Calculate alpha and beta from correct/incorrect answers
      const alpha = profile.correctAnswers + 1;
      const beta = (profile.totalAttempts - profile.correctAnswers) + 1;
      
      // Blend Thompson sampling (80%) with randomness (20%)
      const thompsonSample = sampleBeta(alpha, beta);
      sample = (thompsonSample * 0.8) + (Math.random() * 0.2);
      
      return {
        categoryId: profile.categoryId,
        sample,
        category: profile.category
      };
    });

    // Shuffle before sorting to break ties randomly
    categoryScores.sort(() => Math.random() - 0.5);
    // Then sort by sample value
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