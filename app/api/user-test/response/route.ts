// File: app/api/user-test/response/route.ts
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) {
    console.log("Unauthorized request: No userId");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userTestId = searchParams.get('userTestId');
  const questionId = searchParams.get('questionId');

  if (!userTestId || !questionId) {
    return NextResponse.json({ error: "Missing required query parameters" }, { status: 400 });
  }

  try {
    const existingResponse = await prisma.userResponse.findFirst({
      where: {
        userTestId,
        questionId,
        userId,
      },
    });

    if (!existingResponse) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    return NextResponse.json(existingResponse);
  } catch (error) {
    console.error('Error fetching user response:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Modify the existing POST route
export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    console.log("Unauthorized request: No userId");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userTestId, questionId, userAnswer, isCorrect, timeSpent, userNotes } = body;

    // Only validate questionId as required
    if (!questionId) {
      console.log("Missing required field: questionId");
      return NextResponse.json({ error: "Missing required field: questionId" }, { status: 400 });
    }

    // Truncate values to prevent exceeding column limits
    const truncatedUserAnswer = userAnswer?.substring(0, 200) || '';
    const truncatedUserNotes = userNotes?.substring(0, 750) || '';

    // Check for existing response
    const existingResponse = await prisma.userResponse.findFirst({
      where: {
        userId,
        questionId,
        ...(userTestId && { userTestId }),
      },
    });

    if (existingResponse) {
      const timestamp = new Date().toISOString();
      const formattedNote = `[${timestamp}] - ${truncatedUserNotes}`;
      const updatedUserNotes = existingResponse.userNotes
        ? `${existingResponse.userNotes}\n${formattedNote}`.substring(0, 1000)
        : formattedNote;

      const updatedResponse = await prisma.userResponse.update({
        where: { id: existingResponse.id },
        data: {
          userAnswer: truncatedUserAnswer || existingResponse.userAnswer,
          isCorrect: isCorrect !== undefined ? isCorrect : existingResponse.isCorrect,
          timeSpent: timeSpent || existingResponse.timeSpent,
          userNotes: updatedUserNotes,
        },
        include: {
          question: true,
          userTest: true,
          Category: true,
        },
      });

      return NextResponse.json(updatedResponse);
    } else {
      const newResponse = await prisma.userResponse.create({
        data: {
          userId,
          ...(userTestId && { userTestId }),
          questionId,
          userAnswer: truncatedUserAnswer,
          isCorrect: isCorrect || false,
          timeSpent: timeSpent || 0,
          userNotes: truncatedUserNotes ? `[${new Date().toISOString()}] - ${truncatedUserNotes}` : '',
        },
        include: {
          question: true,
          userTest: true,
          Category: true,
        },
      });

      return NextResponse.json(newResponse);
    }
  } catch (error) {
    console.error('Error handling user response:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, userTestId, questionId, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
    }

    // Handle notes separately to append timestamps
    if (updateData.userNotes) {
      updateData.userNotes = `${new Date().toISOString()} - ${updateData.userNotes}`;
    }
    if (updateData.reviewNotes) {
      updateData.reviewNotes = `${new Date().toISOString()} - ${updateData.reviewNotes}`;
    }

    // Update the response
    const updatedResponse = await prisma.userResponse.update({
      where: { id, userId },
      data: {
        ...updateData,
        answeredAt: new Date(),
      },
      include: {
        question: true,
        userTest: true,
        Category: true,
      },
    });

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error('Error updating user response:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}