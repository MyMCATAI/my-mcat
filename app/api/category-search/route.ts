// api/category/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { getCategories } from "@/lib/category";

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
    const selectedSubject = searchParams.get("subject");

    // Fetch knowledge profiles and user info in parallel
    const [knowledgeProfiles, userInfo] = await Promise.all([
      prisma.knowledgeProfile.findMany({
        where: { userId },
        orderBy: { conceptMastery: "asc" },
        include: { category: true }
      }),
      prisma.userInfo.findUnique({
        where: { userId },
        select: { diagnosticScores: true }
      })
    ]);

    // Fetch categories with filters
    let allCategories = await prisma.category.findMany({
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
          ...(selectedSubject ? [{ subjectCategory: { equals: selectedSubject } }] : []),
        ],
      },
    });

    // Combine categories with knowledge profiles
    let sortedCategories = allCategories.map(category => {
      const profile = knowledgeProfiles.find(p => p.categoryId === category.id);
      return {
        ...category,
        conceptMastery: profile ? profile.conceptMastery : null
      };
    });

    // Sort by concept mastery
    sortedCategories.sort((a, b) => {
      if (a.conceptMastery === null && b.conceptMastery === null) return 0;
      if (a.conceptMastery === null) return 1;
      if (b.conceptMastery === null) return -1;
      return a.conceptMastery - b.conceptMastery;
    });

    // Sort by diagnostic scores if available
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

      sortedCategories.sort((a, b) => {
        const rankA = scoreRanking[a.subjectCategory] ?? 999;
        const rankB = scoreRanking[b.subjectCategory] ?? 999;
        return rankA - rankB;
      });
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
