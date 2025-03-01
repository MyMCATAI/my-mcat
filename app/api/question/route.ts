// File: app/api/question/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { getQuestions,  getQuestionsSimple } from "@/lib/question";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  
  const seenTimes: number = 3; // for filtering, number of times the question has been seen within last intervalTotalHours
  const intervalTotalHours: number = 48; // for filtering, time interval for filtering out frequently presented questions
  const intervalCorrectHours: number = 72; // for filtering, time interval for filtering out correctly answered questions

  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const simple = searchParams.get('simple') !== 'false'; // defaults to true

    // Convert string inputs to string arrays
    const contentCategory = searchParams.get('contentCategory')
      ? [searchParams.get('contentCategory')!]
      : undefined;
    
    const conceptCategory = searchParams.getAll('conceptCategory')
      .map(cat => cat.replace(/_/g, ' '))
      || undefined;
    
    const subjectCategory = searchParams.getAll('subjectCategory')
      .map(cat => cat.replace(/_/g, ' '))
      || undefined;

    if (simple) {
      const result = await getQuestionsSimple({
        contentCategory: contentCategory || [],
        conceptCategory: conceptCategory || [],
        subjectCategory: subjectCategory || [],
        userId,
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '10'),
        types: searchParams.getAll('types')
          .map(type => type.trim())
          .filter(type => type.length > 0) // Remove any empty strings
          || [],
      });

      return NextResponse.json(result);
    }

    const categoryId = searchParams.get('categoryId');
    const passageId = searchParams.get('passageId');
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const difficulty = searchParams.get('difficulty') ? parseInt(searchParams.get('difficulty')!) : undefined; // Set to undefined if not specified
    const types = searchParams.getAll('types')
      .map(type => type.trim())
      .filter(type => type.length > 0) // Remove any empty strings
      || [];
    const incorrectStreakProbWeight = parseFloat(searchParams.get('incorrectStreakProbWeight') || '0.25');
    const conceptContentMasteryProbWeight = parseFloat(searchParams.get('conceptContentMasteryProbWeight') || '0.5');
    const desiredDifficultyProbWeight = parseFloat(searchParams.get('desiredDifficultyProbWeight') || '0.05');
    const testFrequencyProbWeight = parseFloat(searchParams.get('testFrequencyProbWeight') || '0.2');

    const result = await getQuestions({ 
      categoryId: categoryId || undefined, 
      passageId: passageId || undefined, 
      contentCategory: contentCategory || [],
      conceptCategory: conceptCategory || [],
      subjectCategory: subjectCategory || [],
      page, 
      pageSize,
      desiredDifficulty: difficulty || undefined,
      types: types || [],
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