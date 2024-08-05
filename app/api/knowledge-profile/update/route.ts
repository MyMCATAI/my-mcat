// File: app/api/knowledge-profile/update/route.ts

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

      return prisma.knowledgeProfile.upsert({
        where: {
          userId_categoryId: {
            userId: userId,
            categoryId: response.categoryId as string,
          },
        },
        update: {
          correctAnswers: response._count.isCorrect,
          totalAttempts: response._count.isCorrect,
          lastAttemptAt: latestResponse?.answeredAt || new Date(),
        },
        create: {
          userId: userId,
          categoryId: response.categoryId as string,
          correctAnswers: response._count.isCorrect,
          totalAttempts: response._count.isCorrect,
          lastAttemptAt: latestResponse?.answeredAt || new Date(),
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