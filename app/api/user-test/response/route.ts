// File: app/api/user-test/response/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userTestId, questionId, userAnswer, isCorrect, timeSpent, userNotes } = body;

    if (!userTestId || !questionId || !userAnswer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the question with its category
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { category: true }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const responseData = {
      userTestId,
      questionId,
      categoryId: question.categoryId,
      userAnswer,
      isCorrect,
      timeSpent: timeSpent || undefined,
      userNotes: userNotes || undefined,
      answeredAt: new Date(),
    };

    // Check if a response for this question already exists
    const existingResponse = await prisma.userResponse.findFirst({
      where: {
        userTestId,
        questionId,
      },
    });

    let savedResponse;
    if (existingResponse) {
      // Update existing response
      savedResponse = await prisma.userResponse.update({
        where: { id: existingResponse.id },
        data: responseData,
        include: {
          question: true,
          userTest: true,
          Category: true,
        },
      });
    } else {
      // Create new response
      savedResponse = await prisma.userResponse.create({
        data: responseData,
        include: {
          question: true,
          userTest: true,
          Category: true,
        },
      });
    }

    // Update or create KnowledgeProfile
    await prisma.knowledgeProfile.upsert({
      where: {
        userId_categoryId: {
          userId,
          categoryId: question.categoryId,
        },
      },
      update: {
        correctAnswers: {
          increment: isCorrect ? 1 : 0,
        },
        totalAttempts: {
          increment: 1,
        },
        lastAttemptAt: new Date(),
      },
      create: {
        userId,
        categoryId: question.categoryId,
        correctAnswers: isCorrect ? 1 : 0,
        totalAttempts: 1,
        lastAttemptAt: new Date(),
      },
    });

    return NextResponse.json(savedResponse, { status: 201 });
  } catch (error) {
    console.error('Error handling user response:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}