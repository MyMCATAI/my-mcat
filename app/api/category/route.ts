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
    
    // Add support for specific conceptCategories
    const conceptCategories = searchParams.get('conceptCategories')?.split(',').map(c => decodeURIComponent(c));

    if (useKnowledgeProfiles) {
      const userInfo = await prisma.userInfo.findUnique({
        where: { userId },
        select: { diagnosticScores: true }
      });

      // Modify the base query to include conceptCategories if provided
      const baseWhereClause = {
        ...(includeCARS ? {} : {
          NOT: {
            subjectCategory: "CARs"
          }
        }),
        ...(conceptCategories && conceptCategories.length > 0 ? {
          conceptCategory: {
            in: conceptCategories
          }
        } : {})
      };

      let categories = await prisma.category.findMany({
        where: baseWhereClause,
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

      // Transform data (keeping existing logic)
      let sortedCategories = categories.map(category => {
        const profile = category.knowledgeProfiles[0];
        return {
          ...category,
          hasProfile: !!profile,
          completedAt: profile?.completedAt ?? null,
          completionPercentage: profile?.completionPercentage ?? 0,
          conceptMastery: profile?.conceptMastery ?? null,
          contentMastery: profile?.contentMastery ?? null,
          isCompleted: !!profile?.completedAt,
          knowledgeProfiles: undefined
        };
      });

      // If specific conceptCategories were requested, prioritize their order
      if (conceptCategories && conceptCategories.length > 0) {
        // Create a map for quick lookup
        const categoryMap = new Map(
          sortedCategories.map(cat => [cat.conceptCategory, cat])
        );
        
        // Reorder based on requested conceptCategories and filter out any undefined values
        const orderedCategories = conceptCategories
          .map(concept => categoryMap.get(concept))
          .filter((cat): cat is typeof sortedCategories[0] => cat !== undefined);
        
        // Add any remaining categories that weren't specifically requested
        const remainingCategories = sortedCategories.filter(
          cat => !conceptCategories.includes(cat.conceptCategory)
        );

        sortedCategories = [...orderedCategories, ...remainingCategories];
      } else {
        // Keep existing sorting logic for non-specific requests
        sortedCategories.sort((a, b) => {
          if (a.hasProfile !== b.hasProfile) {
            return a.hasProfile ? 1 : -1;
          }
          if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
          }
          if (!a.isCompleted && !b.isCompleted && a.hasProfile && b.hasProfile) {
            if (a.conceptMastery === null && b.conceptMastery === null) return 0;
            if (a.conceptMastery === null) return 1;
            if (b.conceptMastery === null) return -1;
            return a.conceptMastery - b.conceptMastery;
          }
          return 0;
        });

        // Apply diagnostic score sorting if available
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
      // Use existing getCategories function for normal fetching
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