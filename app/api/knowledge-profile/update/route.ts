// api/knowledge-profile/update/route.ts
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all user responses for the current user
    const userResponses = await prisma.userResponse.findMany({
      where: {
        userTest: {
          userId: userId
        },
        categoryId: { not: null }
      },
      include: {
        Category: true
      }
    });

    // Group responses by category
    const groupedResponses = userResponses.reduce((acc, response) => {
      if (!acc[response.categoryId!]) {
        acc[response.categoryId!] = [];
      }
      acc[response.categoryId!].push(response);
      return acc;
    }, {} as Record<string, typeof userResponses>);

    // Update KnowledgeProfile for each category
    const updatePromises = Object.entries(groupedResponses).map(async ([categoryId, responses]) => {
      const numCorrects = responses.filter(r => r.isCorrect).length;
      const numIncorrects = responses.length - numCorrects;
      const conceptMastery = (numCorrects + 1) / (numCorrects + 1 + numIncorrects + 1);
      
      const latestResponse = responses.reduce((latest, current) => 
        latest.answeredAt > current.answeredAt ? latest : current
      );

      return prisma.knowledgeProfile.upsert({
        where: {
          userId_categoryId: {
            userId: userId,
            categoryId: categoryId,
          },
        },
        update: {
          correctAnswers: numCorrects,
          totalAttempts: responses.length,
          lastAttemptAt: latestResponse.answeredAt,
          conceptMastery: conceptMastery,
        },
        create: {
          userId: userId,
          categoryId: categoryId,
          correctAnswers: numCorrects,
          totalAttempts: responses.length,
          lastAttemptAt: latestResponse.answeredAt,
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