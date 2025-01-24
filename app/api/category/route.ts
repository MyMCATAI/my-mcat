// api/category/route.ts
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { Category } from "@/types";

// Helper function for Thompson sampling
function sampleBeta(alpha: number, beta: number): number {
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  const stdDev = Math.sqrt(variance);
  
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  return Math.max(0, Math.min(1, mean + z * stdDev));
}

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

    // Transform and sort by mastery instead of Thompson sampling
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

    // Apply search filtering if query exists
    if (searchQuery) {
      sortedCategories = sortedCategories.filter(category => 
        category.conceptCategory.toLowerCase().includes(searchQuery)
      );
    }

    // Apply subject filtering if subjects are specified
    if (subjects?.length) {
      sortedCategories = sortedCategories.filter(category => 
        subjects.includes(category.subjectCategory)
      );
    }

    // Apply filtering and sorting
    if (useKnowledgeProfiles) {
      sortedCategories = sortedCategories
        .filter(cat => cat.hasContent)
        .filter(cat => {
          // If excludeCompleted is true, we still want to include completed categories
          // that have very low mastery (below 30%)
          if (excludeCompleted) {
            return !cat.isCompleted || (cat.conceptMastery < 0.3);
          }
          return true;
        })
        .sort((a, b) => {
          // Prioritize uncompleted categories
          if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
          }
          // Then sort by concept mastery (lowest first)
          return a.conceptMastery - b.conceptMastery;
        });
    }

    // Handle specific concept categories if requested
    if (conceptCategories?.length) {
      type TransformedCategory = typeof sortedCategories[0];
      const categoryMap = new Map(sortedCategories.map(cat => [cat.conceptCategory, cat]));
      const orderedCategories = conceptCategories
        .map(concept => categoryMap.get(concept))
        .filter((cat): cat is TransformedCategory => cat !== undefined);
      
      const remainingCategories = sortedCategories.filter(
        cat => !conceptCategories.includes(cat.conceptCategory)
      );

      sortedCategories = [...orderedCategories, ...remainingCategories];
    }

    // Paginate results
    const skip = (page - 1) * pageSize;
    const items = sortedCategories.slice(skip, skip + pageSize);
    const total = sortedCategories.length;

    return NextResponse.json({
      items,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });

  } catch (error) {
    console.error('[CATEGORY_GET]', error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}