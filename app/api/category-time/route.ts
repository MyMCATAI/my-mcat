export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

// Helper function for Thompson sampling (reused from category route)
function sampleBeta(alpha: number, beta: number): number {
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  const stdDev = Math.sqrt(variance);
  
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  return Math.max(0, Math.min(1, mean + z * stdDev));
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const availableMinutes = parseInt(searchParams.get('minutes') || '60');
    const tolerance = parseInt(searchParams.get('tolerance') || '15'); // Time flexibility in minutes

    // Get categories with knowledge profiles and their content
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        conceptCategory: true,  // Explicitly select conceptCategory
        knowledgeProfiles: {
          where: { userId }
        },
        contents: {
          select: { 
            id: true, 
            minutes_estimate: true,
            type: true
          }
        }
      }
    });

    console.log("Found categories:", categories.map(c => ({
      id: c.id,
      conceptCategory: c.conceptCategory,
      contentCount: c.contents.length
    })));

    // Transform and apply Thompson sampling with time constraints
    let eligibleCategories = categories
      .map(category => {
        const profile = category.knowledgeProfiles[0];
        const hasContent = category.contents.length > 0;

        // Group content by type
        const videoContents = category.contents.filter(c => c.type === 'video');
        const readingContents = category.contents.filter(c => c.type === 'reading');

        // Calculate total minutes for each type
        const videoMinutes = videoContents.reduce((sum, content) => 
          sum + (content.minutes_estimate || 0), 0);
        const readingMinutes = readingContents.reduce((sum, content) => 
          sum + (content.minutes_estimate || 0), 0);

        // Check if either type fits the time slot
        const videoFits = Math.abs(videoMinutes - availableMinutes) <= tolerance;
        const readingFits = Math.abs(readingMinutes - availableMinutes) <= tolerance;
        const fitsTimeSlot = videoFits || readingFits;

        // Determine which type to use - if neither fits, pick the one with content
        let contentType = null;
        let totalMinutes = 0;
        
        if (videoFits) {
          contentType = 'video';
          totalMinutes = videoMinutes;
        } else if (readingFits) {
          contentType = 'reading';
          totalMinutes = readingMinutes;
        } else if (videoContents.length > 0) {
          contentType = 'video';
          totalMinutes = videoMinutes;
        } else if (readingContents.length > 0) {
          contentType = 'reading';
          totalMinutes = readingMinutes;
        }

        // Calculate Thompson sampling score
        let sample = 1; // Default to lowest priority
        if (profile) {
          const alpha = profile.correctAnswers + 1; // Laplace smoothing
          const beta = (profile.totalAttempts - profile.correctAnswers) + 1;
          sample = sampleBeta(alpha, beta);
        }

        const result = {
          id: category.id,
          name: category.conceptCategory,
          hasProfile: !!profile,
          completedAt: profile?.completedAt ?? null,
          completionPercentage: profile?.completionPercentage ?? 0,
          conceptMastery: profile?.contentMastery ?? null,
          contentMastery: profile?.contentMastery ?? null,
          isCompleted: !!profile?.completedAt,
          hasContent,
          totalMinutes,
          fitsTimeSlot,
          contentType,
          sample
        };

        console.log("Transformed category:", {
          id: category.id,
          conceptCategory: category.conceptCategory,
          hasContent,
          contentType,
          fitsTimeSlot
        });

        return result;
      })
      .filter(category => 
        category.hasContent && 
        !category.isCompleted &&
        category.contentType // Only include if we found any content
      )
      .sort((a, b) => {
        // First prioritize categories that fit the time slot
        if (a.fitsTimeSlot !== b.fitsTimeSlot) {
          return a.fitsTimeSlot ? -1 : 1;
        }
        // Then sort by mastery (sample)
        return a.sample - b.sample;
      });

    console.log("Eligible categories:", eligibleCategories.map(c => ({
      id: c.id,
      name: c.name,
      contentType: c.contentType,
      fitsTimeSlot: c.fitsTimeSlot
    })));

    // Take top 6 categories
    eligibleCategories = eligibleCategories.slice(0, 6);

    return NextResponse.json({
      items: eligibleCategories,
      totalCategories: eligibleCategories.length
    });

  } catch (error) {
    console.error('[CATEGORY_TIME_GET]', error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 