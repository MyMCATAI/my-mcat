// app/api/user-report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user info to get the score and streak
    const userInfo = await prisma.userInfo.findUnique({
      where: { userId },
      select: { 
        score: true,
        streak: true 
      },
    });

    // Fetch user tests with response review status
    const userTests = await prisma.userTest.findMany({
      where: { 
        userId,
        finishedAt: { not: null },  
        score: { not: null }    
      },
      include: {
        responses: {
          select: {
            id: true,
            isReviewed: true,
            userAnswer: true,
            questionId: true,
            isCorrect: true,
            timeSpent: true,
            categoryId: true
          }
        },
      },
      orderBy: {
        startedAt: 'desc'
      },
    });

    // Filter completed tests with valid scores and reviews
    const completedTests = userTests.filter(test => 
      test.finishedAt !== null && 
      test.score !== null && 
      !isNaN(test.score) &&
      test.responses.every(r => r.userAnswer !== null)  // Ensure all responses have answers
    );

    const reviewedTests = completedTests.filter(test =>
      test.responses.every(r => r.isReviewed === true)
    );

    // Update calculations with null checks
    const totalTestsTaken = completedTests.length;
    const totalQuestionsAnswered = completedTests.reduce((sum, test) => sum + test.responses.length, 0);
    const totalScore = completedTests.reduce((sum, test) => sum + (test.score || 0), 0);
    const averageTestScore = totalTestsTaken > 0 ? (totalScore / totalTestsTaken) : 0;

    // Update time calculations
    const totalTimeSpent = completedTests.reduce((sum, test) => 
      sum + test.responses.reduce((testSum, response) => testSum + (response.timeSpent || 0), 0), 0);
    const averageTimePerQuestion = totalQuestionsAnswered > 0 ? totalTimeSpent / totalQuestionsAnswered : 0;

    const totalTestTime = completedTests.reduce((sum, test) => {
      if (test.startedAt && test.finishedAt) {
        const startTime = new Date(test.startedAt).getTime();
        const endTime = new Date(test.finishedAt).getTime();
        const timeDiff = endTime - startTime;
        console.log('Test timing:', {
          testId: test.id,
          startedAt: test.startedAt,
          finishedAt: test.finishedAt,
          startTime,
          endTime,
          timeDiff,
          timeDiffMinutes: timeDiff / 60000
        });
        return sum + (timeDiff > 0 ? timeDiff : 0);
      }
      return sum;
    }, 0);

    const averageTimePerTest = totalTestsTaken > 0 ? Math.max(0, totalTestTime / totalTestsTaken) : 0;
    console.log('Average time per test:', {
      totalTestTime,
      totalTestsTaken,
      averageTimePerTest,
      averageTimePerTestMinutes: averageTimePerTest / 60000
    });

    // Group questions by category and calculate accuracy
    const categoryAccuracy = completedTests.reduce((acc: Record<string, { correct: number; total: number }>, test: { responses: Array<{ categoryId: string | null; isCorrect: boolean }> }) => {
      test.responses.forEach((response: { categoryId: string | null; isCorrect: boolean }) => {
        if (response.categoryId) {
          if (!acc[response.categoryId]) {
            acc[response.categoryId] = { correct: 0, total: 0 };
          }
          acc[response.categoryId].total++;
          if (response.isCorrect) {
            acc[response.categoryId].correct++;
          }
        }
      });
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    const categoryAccuracyPercentages = Object.entries(categoryAccuracy).reduce<Record<string, number>>((acc, [categoryId, data]) => {
      acc[categoryId] = (data.correct / data.total) * 100;
      return acc;
    }, {});

    return NextResponse.json({
      userScore: userInfo?.score || 0,
      totalTestsTaken,
      testsCompleted: completedTests.length,
      testsReviewed: reviewedTests.length,
      completionRate: totalTestsTaken > 0 ? (completedTests.length / totalTestsTaken) * 100 : 0,
      totalQuestionsAnswered,
      averageTestScore,
      averageTimePerQuestion,
      averageTimePerTest: averageTimePerTest,
      categoryAccuracy: categoryAccuracyPercentages,
      streak: userInfo?.streak || 0,
    });
  } catch (error) {
    console.error('Error generating user report:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
