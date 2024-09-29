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

// Keep the existing PUT route as is
export async function PUT(req: Request) {
  const { userId } = auth();
  if (!userId) {
    console.log("Unauthorized request: No userId");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userTestId, questionId, userNotes, timeSpent } = body;

    // Validate required fields
    if (!userTestId || !questionId) {
      console.log("Missing required fields: userTestId or questionId");
      return NextResponse.json({ error: "Missing required fields: userTestId and questionId are required" }, { status: 400 });
    }

    // Find the existing response
    const existingResponse = await prisma.userResponse.findFirst({
      where: {
        userTestId,
        questionId,
        userId, // Add this to ensure we only find the current user's response
      },
    });

    if (!existingResponse) {
      console.log(`Response not found for userTestId: ${userTestId}, questionId: ${questionId}, userId: ${userId}`);
      return NextResponse.json({ error: "Response not found or you don't have permission to modify it" }, { status: 404 });
    }

    // Prepare the update data
    const timestamp = new Date().toISOString();
    const formattedNote = `[${timestamp}] - ${userNotes}`;
    const updatedUserNotes = existingResponse.userNotes
      ? `${existingResponse.userNotes}\n${formattedNote}`
      : formattedNote;

    const updateData: any = {
      userNotes: updatedUserNotes,
      timeSpent: timeSpent !== undefined ? timeSpent : existingResponse.timeSpent,
    };

    // Update the response
    const updatedResponse = await prisma.userResponse.update({
      where: { id: existingResponse.id },
      data: updateData,
      include: {
        question: true,
        userTest: true,
        Category: true,
      },
    });

    return NextResponse.json(updatedResponse, { status: 200 });
  } catch (error) {
    console.error('Error updating user response:', error);
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 });
  }
}