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

    // Validate required fields
    const missingFields = [];
    if (!userTestId) missingFields.push('userTestId');
    if (!questionId) missingFields.push('questionId');

    if (missingFields.length > 0) {
      console.log(`Missing required fields: ${missingFields.join(', ')}`);
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    // Check if a response for this question already exists
    const existingResponse = await prisma.userResponse.findFirst({
      where: {
        userTestId,
        questionId,
        userId, // Add this to ensure we only find the current user's response
      },
    });

    if (existingResponse) {
      // If response exists, update it (similar to PUT logic)
      const timestamp = new Date().toISOString();
      const formattedNote = `[${timestamp}] - ${userNotes}`;
      const updatedUserNotes = existingResponse.userNotes
        ? `${existingResponse.userNotes}\n${formattedNote}`
        : formattedNote;

      const updatedResponse = await prisma.userResponse.update({
        where: { id: existingResponse.id },
        data: {
          userAnswer: userAnswer || existingResponse.userAnswer,
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
      // If response doesn't exist, create a new one
      const newResponse = await prisma.userResponse.create({
        data: {
          userId, // Ensure we're setting the userId
          userTestId,
          questionId,
          userAnswer: userAnswer || '',
          isCorrect: isCorrect || false,
          timeSpent: timeSpent || 0,
          userNotes: userNotes ? `[${new Date().toISOString()}] - ${userNotes}` : '',
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