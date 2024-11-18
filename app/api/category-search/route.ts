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
    const useKnowledgeProfiles =
      searchParams.get("useKnowledgeProfiles") === "true";
    const includeCARS = searchParams.get("includeCARS") === "true";
    const searchQuery = searchParams.get("searchQuery");
    const random = searchParams.get("random") === "true";
    // const excludeSubjects =
    //   searchParams.get("excludeSubjects")?.split(",") || [];

    const selectedSubject = searchParams.get("subject");

    let result;

    if (useKnowledgeProfiles) {
      // Fetch all knowledge profiles for the user
      const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
        where: { userId },
        orderBy: { conceptMastery: "asc" },
        include: { category: true },
      });

      let allCategories = await prisma.category.findMany({
        where: {
          AND: [
            searchQuery
              ? {
                  OR: [
                    {
                      subjectCategory: { contains: searchQuery.toLowerCase() },
                    },
                    {
                      conceptCategory: { contains: searchQuery.toLowerCase() },
                    },
                  ],
                }
              : {},
            includeCARS ? {} : { subjectCategory: { not: "CARs" } },
            ...(selectedSubject
              ? [{ subjectCategory: { equals: selectedSubject } }]
              : []),
          ],
        },
      });

      if (random) {
        allCategories = allCategories.sort(() => Math.random() - 0.5);
      }

      const sortedCategories = allCategories.map((category) => {
        const profile = knowledgeProfiles.find(
          (p) => p.categoryId === category.id
        );
        return {
          ...category,
          conceptMastery: profile ? profile.conceptMastery : null,
        };
      });

      // Sort categories: those with profiles first (by conceptMastery), then those without
      sortedCategories.sort((a, b) => {
        if (a.conceptMastery === null && b.conceptMastery === null) return 0;
        if (a.conceptMastery === null) return 1;
        if (b.conceptMastery === null) return -1;
        return a.conceptMastery - b.conceptMastery;
      });

      // Paginate the results
      const startIndex = (page - 1) * pageSize;
      const paginatedCategories = sortedCategories.slice(
        startIndex,
        startIndex + pageSize
      );

      result = {
        items: paginatedCategories,
        totalPages: Math.ceil(sortedCategories.length / pageSize),
        currentPage: page,
      };
    } else {
      result = await getCategories({ page, pageSize });
    }

    console.log(NextResponse.json(result))
    return NextResponse.json(result);
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
