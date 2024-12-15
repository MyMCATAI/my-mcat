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
    const selectedSubjects = searchParams
      .get("subjects")
      ?.split(",")
      .filter(Boolean);
    const isRandom = searchParams.get("random") === "true";
    const checkedIds = searchParams.get("checkedIds")?.split(",").filter(Boolean) || [];

    const userInfo = await prisma.userInfo.findUnique({
      where: { userId },
      select: { diagnosticScores: true },
    });

    // Get all categories first
    const categories = await prisma.category.findMany({
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
            ? [
                {
                  subjectCategory: {
                    in: selectedSubjects,
                  },
                },
              ]
            : []),
          ...(isRandom
            ? [
                {
                  knowledgeProfiles: {
                    none: {
                      AND: [{ userId: userId }, { completedAt: { not: null } }],
                    },
                  },
                },
              ]
            : []),
        ],
      },
      include: {
        knowledgeProfiles: {
          where: { userId },
          select: {
            completedAt: true,
            completionPercentage: true,
            conceptMastery: true,
            contentMastery: true,
          },
        },
      },
    });

    // Transform categories
    let transformedCategories = categories.map((category) => ({
      ...category,
      completedAt: category.knowledgeProfiles[0]?.completedAt || null,
      completionPercentage: category.knowledgeProfiles[0]?.completionPercentage || 0,
      conceptMastery: category.knowledgeProfiles[0]?.conceptMastery || null,
      contentMastery: category.knowledgeProfiles[0]?.contentMastery || null,
      isCompleted: category.knowledgeProfiles[0]?.completedAt ? true : false,
    }));

    let sortedCategories;
    
    if (isRandom) {
      // Just shuffle the array without slicing
      sortedCategories = transformedCategories.sort(() => Math.random() - 0.5);
    } else {
      // Your existing sorting logic for non-random case
      const checkedCategories = transformedCategories.filter(cat => 
        checkedIds.includes(cat.id)
      );
      const uncheckedCategories = transformedCategories.filter(cat => 
        !checkedIds.includes(cat.id)
      );

      checkedCategories.sort((a, b) => 
        checkedIds.indexOf(a.id) - checkedIds.indexOf(b.id)
      );

      const sortedUnchecked = uncheckedCategories.sort((a, b) => {
        if (!a.isCompleted && b.isCompleted) return -1;
        if (a.isCompleted && !b.isCompleted) return 1;
        return a.subjectCategory.localeCompare(b.subjectCategory);
      });

      sortedCategories = [...checkedCategories, ...sortedUnchecked];
    }

    // Calculate pagination
    const totalPages = Math.ceil(sortedCategories.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCategories = sortedCategories.slice(startIndex, endIndex);

    return NextResponse.json({
      items: paginatedCategories,
      totalPages,
      currentPage: page,
      totalItems: sortedCategories.length
    });
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
