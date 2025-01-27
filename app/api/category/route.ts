// api/category/route.ts
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { Category } from "@/types";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const useKnowledgeProfiles = searchParams.get('useKnowledgeProfiles') === 'true';
    const conceptCategories = searchParams.get('conceptCategories')?.split(',');
    const excludeCompleted = searchParams.get('excludeCompleted') === 'true';
    const searchQuery = searchParams.get('searchQuery')?.toLowerCase();
    const subjects = searchParams.get('subjects')?.split(',');

    // Get categories with knowledge profiles
    const categories = await prisma.category.findMany({
      include: {
        knowledgeProfiles: {
          where: { userId },
        },
        contents: {
          select: { id: true, type: true }
        }
      }
    });

    // Transform categories focusing purely on mastery
    let sortedCategories = categories.map(category => {
      const profile = category.knowledgeProfiles[0];
      const hasContent = category.contents.length > 0;

      return {
        ...category,
        hasProfile: !!profile,
        completedAt: profile?.completedAt ?? null,
        completionPercentage: profile?.completionPercentage ?? 0,
        conceptMastery: profile?.conceptMastery ?? 0,
        contentMastery: profile?.contentMastery ?? 0,
        isCompleted: !!profile?.completedAt,
        hasContent,
        knowledgeProfiles: undefined,
        contents: undefined
      };
    });

    // Apply sorting based on pure weakness
    if (useKnowledgeProfiles) {
      sortedCategories = sortedCategories
        .filter(cat => cat.hasContent)
        .sort((a, b) => {
          // Calculate total mastery with content mastery weighted more heavily
          // since it includes AAMC and UWorld data
          const aTotalMastery = (a.conceptMastery * 0.3) + (a.contentMastery * 0.7);
          const bTotalMastery = (b.conceptMastery * 0.3) + (b.contentMastery * 0.7);
          // Sort by total mastery (weakest first)
          return aTotalMastery - bTotalMastery;
        });
    }

    // Apply filters after sorting
    if (excludeCompleted) {
      sortedCategories = sortedCategories.filter(cat => 
        !cat.isCompleted || (cat.conceptMastery < 0.3) // Keep completed cats with low mastery
      );
    }

    if (conceptCategories?.length) {
      sortedCategories = sortedCategories.filter(cat => 
        conceptCategories.includes(cat.conceptCategory)
      );
    }

    if (subjects?.length) {
      sortedCategories = sortedCategories.filter(cat => 
        subjects.includes(cat.subjectCategory)
      );
    }

    if (searchQuery) {
      sortedCategories = sortedCategories.filter(cat => 
        cat.conceptCategory.toLowerCase().includes(searchQuery) ||
        cat.contentCategory.toLowerCase().includes(searchQuery) ||
        cat.subjectCategory.toLowerCase().includes(searchQuery)
      );
    }

    // Paginate results
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedCategories = sortedCategories.slice(start, end);

    return NextResponse.json({
      items: paginatedCategories,
      totalCategories: sortedCategories.length,
      page,
      pageSize,
      totalPages: Math.ceil(sortedCategories.length / pageSize)
    });

  } catch (error) {
    console.error('[CATEGORY_GET]', error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}