// File: app/api/questions/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { getQuestions, createQuestion, updateQuestion, getQuestionById } from "@/lib/question";
import prisma from "@/lib/prismadb";
import { allowedAdminUserIds } from '@/lib/utils';

export async function GET(req: Request) {
  
  console.log("GET request received");

  const seenTimes: number = 3; // for filtering, number of times the question has been seen within last intervalTotalHours
  const intervalTotalHours: number = 48; // for filtering, time interval for filtering out frequently presented questions
  const intervalCorrectHours: number = 72; // for filtering, time interval for filtering out correctly answered questions

  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const passageId = searchParams.get('passageId');
    const contentCategory = searchParams.get('contentCategory');
    const conceptCategory = searchParams.get('conceptCategory')?.replace(/_/g, ' ') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const difficulty = searchParams.get('difficulty') ? parseInt(searchParams.get('difficulty')!) : undefined; // Set to undefined if not specified
    const types = searchParams.get('types');
    const incorrectStreakProbWeight = parseFloat(searchParams.get('incorrectStreakProbWeight') || '0.25');
    const conceptContentMasteryProbWeight = parseFloat(searchParams.get('conceptContentMasteryProbWeight') || '0.5');
    const desiredDifficultyProbWeight = parseFloat(searchParams.get('desiredDifficultyProbWeight') || '0.05');
    const testFrequencyProbWeight = parseFloat(searchParams.get('testFrequencyProbWeight') || '0.2');
    
    const result = await getQuestions({ 
      categoryId: categoryId || undefined, 
      passageId: passageId || undefined, 
      contentCategory: contentCategory || undefined,
      conceptCategory: conceptCategory || undefined,
      page, 
      pageSize,
      desiredDifficulty: difficulty || undefined,
      types: types || undefined,
      seenTimes,
      intervalTotalHours, // Pass the maxRelevantIntervalHours for filtering UserResponse
      intervalCorrectHours, // Pass the maxRelevantIntervalHours for filtering UserResponse
      userId,
      incorrectStreakProbWeight, 
      conceptContentMasteryProbWeight, 
      desiredDifficultyProbWeight, 
      testFrequencyProbWeight
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log('[QUESTIONS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId || !allowedAdminUserIds.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Validate required fields
    if (!body.questionID || !body.questionContent || !body.questionOptions || !body.contentCategory || !body.categoryId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Ensure questionOptions is an array of strings
    if (!Array.isArray(body.questionOptions) || body.questionOptions.length === 0) {
      return new NextResponse("questionOptions must be a non-empty array of strings", { status: 400 });
    }

    const newQuestion = await createQuestion({
      questionID: body.questionID,
      questionContent: body.questionContent,
      questionOptions: body.questionOptions,
      questionAnswerNotes: body.questionAnswerNotes,
      contentCategory: body.contentCategory,
      passageId: body.passageId,
      categoryId: body.categoryId,
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.log('[QUESTIONS_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId || !allowedAdminUserIds.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log(body)
    // Validate required fields
    if (!body.id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    // Log body details
    console.log('PUT request body:', {
      id: body.id,
      questionContent: body.questionContent,
      questionOptions: body.questionOptions,
      questionAnswerNotes: body.questionAnswerNotes,
      contentCategory: body.contentCategory,
      passageId: body.passageId,
      categoryId: body.categoryId,
      context: body.context,
      difficulty: body.difficulty 
    });

    // Create an object with only the fields that are present in the request body
    const updateData: Partial<{
      questionContent: string;
      questionOptions: string;
      questionAnswerNotes: string;
      contentCategory: string;
      passageId: string;
      categoryId: string;
      context: string;
      difficulty: number;
    }> = {};

    if (body.questionContent) updateData.questionContent = body.questionContent;
    if (body.questionOptions) updateData.questionOptions = JSON.stringify(body.questionOptions);
    if (body.questionAnswerNotes) updateData.questionAnswerNotes = body.questionAnswerNotes;
    if (body.contentCategory) updateData.contentCategory = body.contentCategory;
    if (body.passageId) updateData.passageId = body.passageId;
    if (body.categoryId) updateData.categoryId = body.categoryId;
    if (body.context) updateData.context = body.context;
    if (body.difficulty) updateData.difficulty = body.difficulty;

    // Check if the question exists before updating
    const existingQuestion = await prisma.question.findUnique({
      where: { id: body.id }
    });

    if (!existingQuestion) {
      return new NextResponse("Question not found", { status: 404 });
    }

    const updatedQuestion = await updateQuestion(body.id, updateData);

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.log('[QUESTIONS_PUT]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}