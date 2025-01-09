// api/knowledge-profile/update/route.ts
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

interface SourceWeights {
  aamc: number;
  uworld: number;
  mymcat: number;
}

// Base weights when all sources are available
const BASE_WEIGHTS: SourceWeights = {
  aamc: 0.5,    // AAMC has highest weight
  uworld: 0.3,  // UWorld second
  mymcat: 0.2   // MyMCAT internal questions
};

const TIME_DECAY_FACTOR = 0.1; // Adjust this value to control decay rate

function calculateTimeDecayWeight(answeredAt: Date): number {
  const ageInDays = (Date.now() - answeredAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-TIME_DECAY_FACTOR * ageInDays);
}

function getAdjustedWeights(
  hasAAMC: boolean,
  hasUWorld: boolean,
  hasMyMCAT: boolean
): SourceWeights {
  let weights = { ...BASE_WEIGHTS };
  let totalWeight = 0;

  // Zero out weights for missing sources
  if (!hasAAMC) weights.aamc = 0;
  if (!hasUWorld) weights.uworld = 0;
  if (!hasMyMCAT) weights.mymcat = 0;

  // Calculate total of remaining weights
  totalWeight = weights.aamc + weights.uworld + weights.mymcat;

  // If no sources, default to equal weight for any that exist
  if (totalWeight === 0) {
    const availableSources = [hasAAMC, hasUWorld, hasMyMCAT].filter(Boolean).length;
    if (availableSources === 0) return BASE_WEIGHTS; // Fallback to base weights if somehow nothing exists
    const equalWeight = 1 / availableSources;
    if (hasAAMC) weights.aamc = equalWeight;
    if (hasUWorld) weights.uworld = equalWeight;
    if (hasMyMCAT) weights.mymcat = equalWeight;
    return weights;
  }

  // Normalize remaining weights to sum to 1
  const normalizer = 1 / totalWeight;
  return {
    aamc: weights.aamc * normalizer,
    uworld: weights.uworld * normalizer,
    mymcat: weights.mymcat * normalizer
  };
}

function calculateSourceMastery(
  correct: number,
  incorrect: number,
  weight: number = 1,
  timeWeights: number[] = []
): number {
  if (correct + incorrect === 0) return 0;
  
  // If no time weights provided, use equal weights
  const weights = timeWeights.length > 0 ? timeWeights : Array(correct + incorrect).fill(1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  // Normalize weights to sum to 1
  const normalizedWeights = weights.map(w => w / totalWeight);
  
  // Calculate weighted mastery
  const mastery = (correct / (correct + incorrect)) * weight;
  
  return mastery;
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all user responses for the current user
    const userResponses = await prisma.userResponse.findMany({
      where: {
        userTest: {
          userId: userId
        },
        categoryId: { not: null }
      },
      include: {
        Category: {
          select: {
            id: true,
            contentCategory: true,
            conceptCategory: true
          }
        }
      }
    });

    // Get all data pulses for the user
    const dataPulses = await prisma.dataPulse.findMany({
      where: {
        userId: userId
      }
    });

    // Group responses by category (for concept mastery)
    const groupedResponses = userResponses.reduce((acc, response) => {
      if (!acc[response.categoryId!]) {
        acc[response.categoryId!] = [];
      }
      acc[response.categoryId!].push(response);
      return acc;
    }, {} as Record<string, typeof userResponses>);

    // Group responses by content category
    const contentGroupedResponses = userResponses.reduce((acc, response) => {
      const contentCategory = response.Category!.contentCategory;
      if (!acc[contentCategory]) {
        acc[contentCategory] = [];
      }
      acc[contentCategory].push(response);
      return acc;
    }, {} as Record<string, typeof userResponses>);

    // Group data pulses by content category
    const contentGroupedPulses = dataPulses.reduce((acc, pulse) => {
      if (!acc[pulse.name]) {
        acc[pulse.name] = {
          aamc: { positive: 0, negative: 0 },
          uworld: { positive: 0, negative: 0 }
        };
      }
      
      if (pulse.source.toLowerCase().includes('aamc')) {
        acc[pulse.name].aamc.positive += pulse.positive;
        acc[pulse.name].aamc.negative += pulse.negative;
      } else if (pulse.source.toLowerCase().includes('uworld')) {
        acc[pulse.name].uworld.positive += pulse.positive;
        acc[pulse.name].uworld.negative += pulse.negative;
      }
      
      return acc;
    }, {} as Record<string, { 
      aamc: { positive: number, negative: number },
      uworld: { positive: number, negative: number }
    }>);

    // Calculate content masteries with weighted sources
    const contentMasteries = Object.entries(contentGroupedResponses).reduce((acc, [contentCategory, responses]) => {
      // Calculate MyMCAT mastery
      const mymcatCorrect = responses.filter(r => r.isCorrect).length;
      const mymcatTotal = responses.length;
      const hasMymcat = mymcatTotal > 0;

      // Get external source masteries
      const externalSources = contentGroupedPulses[contentCategory] || {
        aamc: { positive: 0, negative: 0 },
        uworld: { positive: 0, negative: 0 }
      };

      const hasAAMC = externalSources.aamc.positive + externalSources.aamc.negative > 0;
      const hasUWorld = externalSources.uworld.positive + externalSources.uworld.negative > 0;

      // Get adjusted weights based on available sources
      const weights = getAdjustedWeights(hasAAMC, hasUWorld, hasMymcat);

      // Calculate individual masteries
      const mymcatMastery = hasMymcat ? 
        calculateSourceMastery(mymcatCorrect, mymcatTotal - mymcatCorrect, weights.mymcat) : 0;

      const aamcMastery = hasAAMC ? 
        calculateSourceMastery(
          externalSources.aamc.positive,
          externalSources.aamc.negative,
          weights.aamc
        ) : 0;

      const uworldMastery = hasUWorld ? 
        calculateSourceMastery(
          externalSources.uworld.positive,
          externalSources.uworld.negative,
          weights.uworld
        ) : 0;

      // Combine all sources
      const totalMastery = mymcatMastery + aamcMastery + uworldMastery;
      acc[contentCategory] = totalMastery;
      
      return acc;
    }, {} as Record<string, number>);

    // Update KnowledgeProfile for each category
    const updatePromises = Object.entries(groupedResponses).map(async ([categoryId, responses]) => {
      // Calculate time decay weights for each response
      const timeWeights = responses.map(r => calculateTimeDecayWeight(r.answeredAt));
      
      // Split responses into correct and incorrect, maintaining time weights
      const correctResponses = responses.filter((r, i) => r.isCorrect).map((r, i) => ({
        response: r,
        weight: timeWeights[i]
      }));
      
      const incorrectResponses = responses.filter((r, i) => !r.isCorrect).map((r, i) => ({
        response: r,
        weight: timeWeights[i]
      }));

      // Calculate weighted sums
      const weightedCorrect = correctResponses.reduce((sum, { weight }) => sum + weight, 0);
      const weightedIncorrect = incorrectResponses.reduce((sum, { weight }) => sum + weight, 0);

      const conceptMastery = calculateSourceMastery(
        weightedCorrect,
        weightedIncorrect,
        1,
        timeWeights
      );

      const latestResponse = responses.reduce((latest, current) => 
        latest.answeredAt > current.answeredAt ? latest : current
      );

      const contentCategory = responses[0].Category!.contentCategory;
      const contentMastery = contentMasteries[contentCategory];

      return prisma.knowledgeProfile.upsert({
        where: {
          userId_categoryId: {
            userId: userId,
            categoryId: categoryId,
          },
        },
        update: {
          correctAnswers: responses.filter(r => r.isCorrect).length,
          totalAttempts: responses.length,
          lastAttemptAt: latestResponse.answeredAt,
          conceptMastery: conceptMastery,
          contentMastery: contentMastery,
        },
        create: {
          userId: userId,
          categoryId: categoryId,
          correctAnswers: responses.filter(r => r.isCorrect).length,
          totalAttempts: responses.length,
          lastAttemptAt: latestResponse.answeredAt,
          conceptMastery: conceptMastery,
          contentMastery: contentMastery,
        },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Knowledge profiles updated successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error updating knowledge profiles:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}