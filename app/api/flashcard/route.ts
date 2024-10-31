import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { GET as getQuestions } from '@/app/api/question/route';

export async function GET(req: Request) {
  console.log('GET request received');
  try {
    const { userId } = auth();

    if (!userId) {
      console.log('Unauthorized');
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    console.log(req);
    const response = await fetch(req.url);
    console.log('Response status:', response.status);


    if (!response.ok) {
      throw new Error(`Questions API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Flashcards API response:', data);
    return NextResponse.json(data.questions); // Return just the questions array

  } catch (error) {
    console.log('[FLASHCARDS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
