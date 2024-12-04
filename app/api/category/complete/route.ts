import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { categoryId } = body;

    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    // Upsert the knowledge profile - this will create if it doesn't exist, or update if it does
    const knowledgeProfile = await prisma.knowledgeProfile.upsert({
      where: {
        userId_categoryId: {
          userId,
          categoryId,
        },
      },
      update: {
        completedAt: new Date(),
        completionPercentage: 100,
      },
      create: {
        userId,
        categoryId,
        completedAt: new Date(),
        completionPercentage: 100,
        correctAnswers: 0,
        totalAttempts: 0,
      },
    });

    return NextResponse.json(knowledgeProfile);
  } catch (error) {
    console.log('[CATEGORY_COMPLETE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
