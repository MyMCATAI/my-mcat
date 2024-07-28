
// app/api/user-test/response/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userTestId, questionId, userAnswer, isCorrect, timeSpent, userNotes } = await req.json();

    if (!userTestId || !questionId || !userAnswer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userTest = await prisma.userTest.findUnique({
      where: { id: userTestId },
    });

    if (!userTest || userTest.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userResponse = await prisma.userResponse.create({
      data: {
        userTestId,
        questionId,
        userAnswer,
        isCorrect,
        timeSpent,
        userNotes,
      },
    });

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('Error adding user response:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}