import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all knowledge profiles for the user with their categories
    const profiles = await prisma.knowledgeProfile.findMany({
      where: {
        userId
      },
      include: {
        category: true
      }
    });

    // Group by section and sort within each section
    const groupedProfiles = profiles.reduce((acc, profile) => {
      const section = profile.category.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push({
        subject: profile.category.subjectCategory,
        content: profile.category.contentCategory,
        concept: profile.category.conceptCategory,
        mastery: profile.conceptMastery || 0,
        correctAnswers: profile.correctAnswers,
        totalAttempts: profile.totalAttempts,
        lastAttempt: profile.lastAttemptAt
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Sort each section's array by mastery (weakest first)
    Object.keys(groupedProfiles).forEach(section => {
      groupedProfiles[section].sort((a, b) => a.mastery - b.mastery);
    });

    // Also add section summaries
    const sectionSummaries = Object.entries(groupedProfiles).map(([section, profiles]) => ({
      section,
      averageMastery: profiles.reduce((sum, p) => sum + p.mastery, 0) / profiles.length,
      totalConcepts: profiles.length
    })).sort((a, b) => a.averageMastery - b.averageMastery);

    return NextResponse.json({
      sections: groupedProfiles,
      sectionSummaries,
      weakestConcepts: profiles
        .sort((a, b) => (a.conceptMastery || 0) - (b.conceptMastery || 0))
        .slice(0, 5)
        .map(p => ({
          subject: p.category.subjectCategory,
          content: p.category.contentCategory,
          concept: p.category.conceptCategory,
          mastery: p.conceptMastery || 0,
          section: p.category.section
        }))
    });
  } catch (error) {
    console.error('Error fetching knowledge profile:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 