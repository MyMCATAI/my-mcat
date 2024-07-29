// File: app/api/user-test/response/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";
import { Question, UserResponse } from "@/types";

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

    // First, check if the question exists
    const question: Question | null = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

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
        data: {
          userAnswer,
          isCorrect,
          timeSpent: timeSpent || undefined,
          userNotes: userNotes || undefined,
          answeredAt: new Date(),
        },
        include: {
          question: true,
          userTest: true,
        },
      });
    } else {
      // Create new response
      savedResponse = await prisma.userResponse.create({
        data: {
          userTestId,
          questionId,
          userAnswer,
          isCorrect,
          timeSpent: timeSpent || undefined,
          userNotes: userNotes || undefined,
          answeredAt: new Date(),
        },
        include: {
          question: true,
          userTest: true,
        },
      });
    }

    return NextResponse.json(savedResponse, { status: 201 });
  } catch (error) {
    console.error('Error handling user response:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}