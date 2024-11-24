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


    // TODO josh update this to use the new diagnostic scores


    
    let result;

    if (useKnowledgeProfiles) {
      // Fetch all knowledge profiles for the user
      const [knowledgeProfiles, userInfo] = await Promise.all([
        prisma.knowledgeProfile.findMany({
          where: { userId },
          orderBy: { conceptMastery: 'asc' },
          include: { category: true }
        }),
        prisma.userInfo.findUnique({
          where: { userId },
          select: { diagnosticScores: true }
        })
      ]);

      // Fetch all categories
      let allCategories = await prisma.category.findMany();

      // If includeCARS is false, filter out categories with subjectCategory "CARs"
      if (!includeCARS) {
        allCategories = allCategories.filter(category => category.subjectCategory !== "CARs");
      }

      // Combine knowledge profiles with categories
      let sortedCategories = allCategories.map(category => {
        const profile = knowledgeProfiles.find(p => p.categoryId === category.id);
        return {
          ...category,
          conceptMastery: profile ? profile.conceptMastery : null
        };
      });

      // Sort categories: those with profiles first (by conceptMastery), then those without
      sortedCategories.sort((a, b) => {
        if (a.conceptMastery === null && b.conceptMastery === null) return 0;
        if (a.conceptMastery === null) return 1;
        if (b.conceptMastery === null) return -1;
        return a.conceptMastery - b.conceptMastery;
      });


      if (userInfo?.diagnosticScores) {
        console.log('User diagnostic scores:', userInfo.diagnosticScores);
        // Sort the categories by diagnostic scores before pagination
        sortedCategories = sortCategoriesByDiagnosticScores(
          sortedCategories, 
          userInfo.diagnosticScores
        );
      }

      // Paginate the results
      const startIndex = (page - 1) * pageSize;
      const paginatedCategories = sortedCategories.slice(startIndex, startIndex + pageSize);

      result = {
        items: paginatedCategories,
        totalPages: Math.ceil(sortedCategories.length / pageSize),
        currentPage: page
      };
    } else {
      // Use the existing getCategories function for normal fetching
      result = await getCategories({ 
        page, 
        pageSize, 
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.log('[CATEGORIES_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}