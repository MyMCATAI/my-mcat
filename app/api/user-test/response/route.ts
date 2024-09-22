// File: app/api/user-test/response/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    console.log("Unauthorized request: No userId");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userTestId, questionId, userAnswer, isCorrect, timeSpent, userNotes, weighting, reviewNotes, isReviewed } = body;

    // Validate required fields
    const missingFields = [];
    if (!userTestId) missingFields.push('userTestId');
    if (!questionId) missingFields.push('questionId');

    if (missingFields.length > 0) {
      console.log(`Missing required fields: ${missingFields.join(', ')}`);
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    // Fetch the question with its category
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { category: true }
    });

    if (!question) {
      console.log(`Question not found: ${questionId}`);
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Check if a response for this question already exists
    const existingResponse = await prisma.userResponse.findFirst({
      where: {
        userTestId,
        questionId,
      },
    });

    let responseData: any = {
      userId,
      userTestId,
      questionId,
      categoryId: question.categoryId,
      weighting: weighting || 1,
      timeSpent: timeSpent !== undefined ? timeSpent : existingResponse?.timeSpent,
      userNotes: userNotes !== undefined ? userNotes : existingResponse?.userNotes,
      reviewNotes: reviewNotes !== undefined ? reviewNotes : existingResponse?.reviewNotes,
      isReviewed: isReviewed !== undefined ? isReviewed : existingResponse?.isReviewed,
      answeredAt: new Date(),
    };

    // Only update userAnswer and isCorrect if they are provided
    if (userAnswer !== undefined) responseData.userAnswer = userAnswer;
    if (isCorrect !== undefined) responseData.isCorrect = isCorrect;

    let savedResponse;
    if (existingResponse) {
      console.log(`Updating existing response: ${existingResponse.id}`);
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
      console.log("Creating new response");
      // Ensure userAnswer and isCorrect are set for new responses
      if (userAnswer === undefined) responseData.userAnswer = '';
      if (isCorrect === undefined) responseData.isCorrect = false;
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
    if (isCorrect !== undefined) {
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
    }

    return NextResponse.json(savedResponse, { status: 201 });
  } catch (error) {
    console.error('Error handling user response:', error);
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId } = auth();
  console.log("PUT request:");

  if (!userId) {
    console.log("Unauthorized request: No userId");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { userTestId, questionId, userAnswer, isCorrect, timeSpent, userNotes, weighting, reviewNotes, isReviewed, flagged } = body;

    console.log("Input body flag:", flagged);
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
        userId, // Ensure the response belongs to the authenticated user
      },
    });

    if (!existingResponse) {
      console.log(`Response not found for userTestId: ${userTestId}, questionId: ${questionId}`);
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    // Prepare the update data
    const updateData: any = {
      timeSpent: timeSpent !== undefined ? timeSpent : existingResponse.timeSpent,
      userNotes: userNotes !== undefined ? userNotes : existingResponse.userNotes,
      weighting: weighting !== undefined ? weighting : existingResponse.weighting,
      isReviewed: isReviewed !== undefined ? isReviewed : existingResponse.isReviewed,
      flagged: flagged !== undefined ? flagged : existingResponse.flagged,
    };

    // Only update userAnswer and isCorrect if they are provided
    if (userAnswer !== undefined) updateData.userAnswer = userAnswer;
    if (isCorrect !== undefined) updateData.isCorrect = isCorrect;

    // Append review notes if provided
    if (reviewNotes !== undefined) {
      updateData.reviewNotes = existingResponse.reviewNotes
        ? `${existingResponse.reviewNotes}\n\n${reviewNotes}`
        : reviewNotes;
    }

    // Update the response with all fields
    const updatedResponse = await prisma.userResponse.update({
      where: { id: existingResponse.id },
      data: updateData,
      include: {
        question: true,
        userTest: true,
        Category: true,
      },
    });

    console.log("Updated response:", updatedResponse.flagged);
    console.log("Output response:", {
      status: 200,
    });

    return NextResponse.json(updatedResponse, { status: 200 });
  } catch (error) {
    console.error('Error updating user response:', error);
    console.log("Output response:", {
      status: 500,
      json: { error: "Internal server error", details: error }
    });
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 });
  }
}