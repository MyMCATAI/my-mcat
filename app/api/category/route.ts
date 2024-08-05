import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";
import { getCategories } from "@/lib/category";

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

    let result;

    if (useKnowledgeProfiles) {
      console.log("useKnowledgeProfiles")
      // Fetch categories based on knowledge profiles
      const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
        where: { userId },
        orderBy: { conceptMastery: 'asc' },
        take: pageSize,
        select: { categoryId: true }
      });
      console.log("knowledgeProfiles",knowledgeProfiles)

      const categoryIds = knowledgeProfiles.map(profile => profile.categoryId);

      // If we don't have enough knowledge profiles, fetch additional random categories
      if (categoryIds.length < pageSize) {
        const additionalCategories = await prisma.category.findMany({
          where: { id: { notIn: categoryIds } },
          take: pageSize - categoryIds.length,
          select: { id: true }
        });
        categoryIds.push(...additionalCategories.map(cat => cat.id));
      }

      // Fetch full category details
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        orderBy: { id: 'asc' },
      });

      const total = await prisma.category.count();

      result = {
        items: categories,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page
      };
    } else {
      

      // Use the existing getCategories function for normal fetching
      console.log("getCategories")
      result = await getCategories({ page, pageSize });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.log('[CATEGORIES_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}