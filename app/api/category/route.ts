// api/category/route.ts
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { getCategories } from "@/lib/category";

const getSectionSubjects = (section: string): string[] => {
  switch (section) {
    case "cars":
      return ["CARs"];
    case "ps":
      return ["Psychology", "Sociology"];
    case "cp":
      return ["Chemistry", "Physics"];
    case "bb":
      return ["Biology", "Biochemistry"];
    default:
      return [];
  }
};

const sortCategoriesByDiagnosticScores = (
  categories: any[], 
  diagnosticScores: any
) => {
  // Convert diagnostic scores to number and create a ranking
  const scoreRanking = Object.entries(diagnosticScores)
    .filter(([key]) => key !== 'total')
    .sort(([, a], [, b]) => Number(a) - Number(b))
    .reduce((acc, [section], index) => {
      getSectionSubjects(section).forEach(subject => {
        acc[subject] = index;
      });
      return acc;
    }, {} as Record<string, number>);

  // Sort categories based on their subject's ranking
  return [...categories].sort((a, b) => {
    const rankA = scoreRanking[a.subjectCategory] ?? 999;
    const rankB = scoreRanking[b.subjectCategory] ?? 999;
    return rankA - rankB;
  });
};

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const useKnowledgeProfiles = searchParams.get('useKnowledgeProfiles') === 'true';
    const includeCARS = searchParams.get('includeCARS') === 'true';

    if (useKnowledgeProfiles) {
      // Get user info for diagnostic scores
      const userInfo = await prisma.userInfo.findUnique({
        where: { userId },
        select: { diagnosticScores: true }
      });

      // Fetch categories with knowledge profiles in a single query
      let categories = await prisma.category.findMany({
        where: includeCARS ? undefined : {
          NOT: {
            subjectCategory: "CARs"
          }
        },
        include: {
          knowledgeProfiles: {
            where: { userId },
            select: {
              completedAt: true,
              completionPercentage: true,
              conceptMastery: true,
              contentMastery: true
            }
          }
        }
      });

      // Transform the data to flatten the structure
      // Since we have a unique constraint, knowledgeProfiles will have either 0 or 1 item
      let sortedCategories = categories.map(category => {
        const profile = category.knowledgeProfiles[0];  // Will be undefined if no profile exists
        return {
          ...category,
          hasProfile: !!profile,
          completedAt: profile?.completedAt ?? null,
          completionPercentage: profile?.completionPercentage ?? 0,
          conceptMastery: profile?.conceptMastery ?? null,
          contentMastery: profile?.contentMastery ?? null,
          isCompleted: !!profile?.completedAt,
          knowledgeProfiles: undefined // Remove the array since we've flattened it
        };
      });

      // Updated sorting logic: no profile first, then incomplete, then completed
      sortedCategories.sort((a, b) => {
        // First, prioritize categories with no profile
        if (a.hasProfile !== b.hasProfile) {
          return a.hasProfile ? 1 : -1;
        }

        // Then, sort by completion status
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        
        // For items with profiles that are incomplete, sort by concept mastery
        if (!a.isCompleted && !b.isCompleted && a.hasProfile && b.hasProfile) {
          if (a.conceptMastery === null && b.conceptMastery === null) return 0;
          if (a.conceptMastery === null) return 1;
          if (b.conceptMastery === null) return -1;
          return a.conceptMastery - b.conceptMastery;
        }
        
        return 0;
      });

      // Apply diagnostic score sorting only to incomplete items with profiles
      if (userInfo?.diagnosticScores) {
        const noProfileCategories = sortedCategories.filter(cat => !cat.hasProfile);
        const incompleteCategories = sortedCategories.filter(cat => cat.hasProfile && !cat.isCompleted);
        const completedCategories = sortedCategories.filter(cat => cat.hasProfile && cat.isCompleted);
        
        const sortedIncomplete = sortCategoriesByDiagnosticScores(
          incompleteCategories,
          userInfo.diagnosticScores
        );
        
        sortedCategories = [...noProfileCategories, ...sortedIncomplete, ...completedCategories];
      }

      // Paginate results
      const startIndex = (page - 1) * pageSize;
      const paginatedCategories = sortedCategories.slice(startIndex, startIndex + pageSize);

      return NextResponse.json({
        items: paginatedCategories,
        totalPages: Math.ceil(sortedCategories.length / pageSize),
        currentPage: page
      });
    } else {
      // Use the existing getCategories function for normal fetching
      const result = await getCategories({ 
        page, 
        pageSize, 
      });
      return NextResponse.json(result);
    }
  } catch (error) {
    console.log('[CATEGORIES_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}