// File: app/api/questions/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import { getQuestions, createQuestion } from "@/lib/question";

export async function GET(req: Request) {
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

    console.log(conceptCategory)
    
    const result = await getQuestions({ 
      categoryId: categoryId || undefined, 
      passageId: passageId || undefined, 
      contentCategory: contentCategory || undefined,
      conceptCategory: conceptCategory || undefined,
      page, 
      pageSize 
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
    
    if (!userId) {
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