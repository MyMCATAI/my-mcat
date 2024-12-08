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

    // Fetch the last 5 user tests and their responses
    const userTests = await prisma.userTest.findMany({
      where: { userId },
      include: { responses: true },
      orderBy: { startedAt: 'desc' },
      take: 5
    });

    // Filter completed tests
    const completedTests = userTests.filter(test => test.finishedAt !== null);

    // Update calculations
    const totalTestsTaken = completedTests.length;
    const totalQuestionsAnswered = completedTests.reduce((sum, test) => sum + test.responses.length, 0);
    const totalScore = completedTests.reduce((sum, test) => sum + (test.score || 0), 0);
    const averageTestScore = totalTestsTaken > 0 ? totalScore / totalTestsTaken : 0;

    // Update time calculations
    const totalTimeSpent = completedTests.reduce((sum, test) => 
      sum + test.responses.reduce((testSum, response) => testSum + (response.timeSpent || 0), 0), 0);
    const averageTimePerQuestion = totalQuestionsAnswered > 0 ? totalTimeSpent / totalQuestionsAnswered : 0;

    const totalTestTime = completedTests.reduce((sum, test) => {
      if (test.startedAt && test.finishedAt) {
        return sum + (new Date(test.finishedAt).getTime() - new Date(test.startedAt).getTime());
      }
      return sum;
    }, 0);

    const averageTimePerTest = totalTestsTaken > 0 ? totalTestTime / totalTestsTaken : 0;

    // Group questions by category and calculate accuracy
    const categoryAccuracy = completedTests.reduce((acc, test) => {
      test.responses.forEach(response => {
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

    const categoryAccuracyPercentages = Object.entries(categoryAccuracy).reduce((acc, [categoryId, data]) => {
      acc[categoryId] = (data.correct / data.total) * 100;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      userScore: userInfo?.score || 0,
      totalTestsTaken,
      testsCompleted: completedTests.length,
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
