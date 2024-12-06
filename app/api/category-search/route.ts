// api/category/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const includeCARS = searchParams.get("includeCARS") === "true";
    const searchQuery = searchParams.get("searchQuery");
    const selectedSubjects = searchParams.get("subjects")?.split(',').filter(Boolean);
    const isRandom = searchParams.get("random") === "true";

    // Single query with join instead of separate queries
    const [categories, userInfo] = await Promise.all([
      prisma.category.findMany({
        where: {
          AND: [
            searchQuery
              ? {
                  OR: [
                    { subjectCategory: { contains: searchQuery.toLowerCase() } },
                    { conceptCategory: { contains: searchQuery.toLowerCase() } },
                  ],
                }
              : {},
            includeCARS ? {} : { subjectCategory: { not: "CARs" } },
            ...(selectedSubjects && selectedSubjects.length > 0
              ? [{
                  subjectCategory: {
                    in: selectedSubjects
                  }
                }]
              : []),
          ],
        },
        ...(isRandom ? {
          orderBy: {
            id: 'asc'
          },
          take: 6
        } : {}),
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
      }),
      prisma.userInfo.findUnique({
        where: { userId },
        select: { diagnosticScores: true }
      })
    ]);

    // Transform the data to flatten the structure
    let sortedCategories = categories.map(category => ({
      ...category,
      completedAt: category.knowledgeProfiles[0]?.completedAt || null,
      completionPercentage: category.knowledgeProfiles[0]?.completionPercentage || 0,
      conceptMastery: category.knowledgeProfiles[0]?.conceptMastery || null,
      contentMastery: category.knowledgeProfiles[0]?.contentMastery || null,
      isCompleted: category.knowledgeProfiles[0]?.completedAt ? true : false
    }));

    if (isRandom) {
      sortedCategories = sortedCategories
        .sort(() => Math.random() - 0.5)
        .slice(0, pageSize);
    } else {
      // First, separate incomplete and complete categories
      const incompleteCategories = sortedCategories.filter(cat => !cat.isCompleted);
      const completedCategories = sortedCategories.filter(cat => cat.isCompleted);

      // Sort each group separately by concept mastery
      const sortByConceptMastery = (a: any, b: any) => {
        if (a.conceptMastery === null && b.conceptMastery === null) return 0;
        if (a.conceptMastery === null) return 1;
        if (b.conceptMastery === null) return -1;
        return a.conceptMastery - b.conceptMastery;
      };

      incompleteCategories.sort(sortByConceptMastery);
      completedCategories.sort(sortByConceptMastery);

      // If diagnostic scores exist, sort within each group
      if (userInfo?.diagnosticScores) {
        const scoreRanking = Object.entries(userInfo.diagnosticScores)
          .filter(([key]) => key !== 'total')
          .sort(([, a], [, b]) => Number(a) - Number(b))
          .reduce((acc, [section], index) => {
            const subjects = getSectionSubjects(section);
            subjects.forEach(subject => {
              acc[subject] = index;
            });
            return acc;
          }, {} as Record<string, number>);

        const sortByDiagnostic = (a: any, b: any) => {
          const rankA = scoreRanking[a.subjectCategory] ?? 999;
          const rankB = scoreRanking[b.subjectCategory] ?? 999;
          return rankA - rankB;
        };

        incompleteCategories.sort(sortByDiagnostic);
        completedCategories.sort(sortByDiagnostic);
      }

      // Combine the groups, maintaining incomplete first
      sortedCategories = [...incompleteCategories, ...completedCategories];
    }

    // Paginate results
    const startIndex = (page - 1) * pageSize;
    const paginatedCategories = sortedCategories.slice(startIndex, startIndex + pageSize);

    const result = {
      items: paginatedCategories,
      totalPages: Math.ceil(sortedCategories.length / pageSize),
      currentPage: page
    };

    return NextResponse.json(result);
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Helper function to get subjects for each section
function getSectionSubjects(section: string): string[] {
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
}
