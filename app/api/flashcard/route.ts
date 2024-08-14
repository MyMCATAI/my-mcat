import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prismadb';

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Fetch all knowledge profiles for the user
    const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
      where: { userId },
      orderBy: [
        { conceptMastery: 'asc' },
        { contentMastery: 'asc' }
      ],
      include: { category: true }
    });

    // Get categoryIds sorted by mastery (prioritizing conceptMastery, then contentMastery)
    const sortedCategoryIds = knowledgeProfiles.map(profile => profile.categoryId);

    // Fetch questions for these categories, prioritizing lower mastery categories
    const questions = await prisma.question.findMany({
      where: {
        categoryId: {
          in: sortedCategoryIds
        }
      },
      orderBy: [
        { categoryId: 'asc' },
      ],
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        category: true
      }
    });

    const totalQuestions = await prisma.question.count({
      where: {
        categoryId: {
          in: sortedCategoryIds
        }
      }
    });

    // Format the response
    const formattedQuestions = questions.map(q => {
      const profile = knowledgeProfiles.find(p => p.categoryId === q.categoryId);
      return {
        id: q.id,
        problem: q.questionContent,
        answer: q.questionOptions.split(',')[0], // Assuming the first option is always the correct answer
        category: q.category.conceptCategory,
        conceptMastery: profile?.conceptMastery || null,
        contentMastery: profile?.contentMastery || null,
        correctAnswers: profile?.correctAnswers || 0,
        totalAttempts: profile?.totalAttempts || 0,
        lastAttemptAt: profile?.lastAttemptAt || null
      };
    });

    const result = {
      flashcards: formattedQuestions,
      totalPages: Math.ceil(totalQuestions / pageSize),
      currentPage: page
    };

    return NextResponse.json(result);
  } catch (error) {
    console.log('[FLASHCARDS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}