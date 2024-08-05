import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all user responses grouped by category
    const userResponses = await prisma.userResponse.groupBy({
      by: ['categoryId'],
      where: {
        userTest: {
          userId: userId
        },
        categoryId: { not: null }
      },
      _count: {
        _all: true,
        isCorrect: true
      },
      _sum: {
        timeSpent: true
      },
      orderBy: {
        categoryId: 'asc'
      }
    });

    // Update KnowledgeProfile for each category
    const updatePromises = userResponses.map(async (response) => {
      const latestResponse = await prisma.userResponse.findFirst({
        where: {
          userTest: {
            userId: userId
          },
          categoryId: response.categoryId
        },
        orderBy: {
          answeredAt: 'desc'
        }
      });

      const numCorrects = response._count.isCorrect;
      const numIncorrects = response._count._all - numCorrects;
      const conceptMastery = (numCorrects + 1) / ((numCorrects + 1) + (numIncorrects + 1));

      return prisma.knowledgeProfile.upsert({
        where: {
          userId_categoryId: {
            userId: userId,
            categoryId: response.categoryId as string,
          },
        },
        update: {
          correctAnswers: numCorrects,
          totalAttempts: response._count._all,
          lastAttemptAt: latestResponse?.answeredAt || new Date(),
          conceptMastery: conceptMastery,
        },
        create: {
          userId: userId,
          categoryId: response.categoryId as string,
          correctAnswers: numCorrects,
          totalAttempts: response._count._all,
          lastAttemptAt: latestResponse?.answeredAt || new Date(),
          conceptMastery: conceptMastery,
        },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Knowledge profiles updated successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error updating knowledge profiles:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}