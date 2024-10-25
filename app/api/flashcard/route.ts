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

async function getFlashcards(userId: string, subjectCategory?: string) {
  const flashcards = await prisma.question.findMany({
    where: {
      types: "flashcard",
      ...(subjectCategory && {
        category: {
          subjectCategory: subjectCategory
        }
      })
    },
    take: 10, // TODO: add pagination - low priority
    include: {
      userResponses: {
        where: { userId },
        select: {
          isCorrect: true,
          timeSpent: true,
        },
      },
      category: {
        select: {
          subjectCategory: true,
          conceptCategory: true,
        },
      },
    },
  });

  return flashcards;
}

export async function GET(req: Request) {
  console.log('GET request received');
  try {
    const { userId } = auth();

    if (!userId) {
      console.log('Unauthorized');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectCategory = searchParams.get('select') || 'Sociology';
    console.log('subjectCategory:', subjectCategory);

    // Ethan check this out
    // subjectCategory is the subject category, e.g. Sociology, Psychology, Chemistry, Physics, Biology, Biochemistry -> pass as input


    const questions = await getFlashcards(userId, subjectCategory);

    return NextResponse.json(questions);
    
  } catch (error) {
    console.log('[FLASHCARDS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
