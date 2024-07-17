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
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const result = await getQuestions({ 
      categoryId: categoryId || undefined, 
      passageId: passageId || undefined, 
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
    const newQuestion = await createQuestion(body);

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.log('[QUESTIONS_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}