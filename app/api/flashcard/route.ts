import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server"
import prisma from '@/lib/prismadb';

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Fetch all knowledge profiles for the user, sorted by mastery
    const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
      where: { userId },
      orderBy: [
        { conceptMastery: 'asc' },
        { contentMastery: 'asc' }
      ],
      include: { category: true }
    });

    // Select the top pageSize categories with lowest mastery
    const selectedProfiles = knowledgeProfiles.slice(0, pageSize);

    // Get categoryIds from shuffled profiles
    const categoryIds = selectedProfiles.map(profile => profile.categoryId);

    // Fetch questions for these categories
    const questions = await prisma.question.findMany({
      where: {
        categoryId: {
          in: categoryIds
        }
      },
      include: {
        category: true
      }
    });

    // todo make this use the real algo

    // Shuffle questions
    const shuffledQuestions = shuffleArray(questions);

    // Select questions for the current page
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const selectedQuestions = shuffledQuestions.slice(startIndex, endIndex);

    // Get total questions count for pagination
    const totalQuestions = await prisma.question.count({
      where: {
        categoryId: {
          in: categoryIds
        }
      }
    });

    // Format the response
    const formattedQuestions = selectedQuestions.map(q => {
      const profile = knowledgeProfiles.find(p => p.categoryId === q.categoryId);
      return {
        id: q.id,
        problem: q.questionContent,
        answer: JSON.parse(q.questionOptions)[0],
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