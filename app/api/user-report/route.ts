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
    // Fetch user info to get the score
    const userInfo = await prisma.userInfo.findUnique({
      where: { userId },
      select: { score: true },
    });

    // Fetch the last 10 user tests and their responses, ordered by startedAt date
    const userTests = await prisma.userTest.findMany({
      where: { 
        userId,
      },
      include: {
        responses: true,
      },
      orderBy: {
        startedAt: 'desc' // Order by most recent first
      },
      take: 10 // Limit to the last 10 tests
    });

    // Calculate the streak
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day

    for (const test of userTests) {
      const testDate = new Date(test.startedAt);
      testDate.setHours(0, 0, 0, 0); // Set to start of day

      if (testDate.getTime() === currentDate.getTime()) {
        // Same day, continue to next test
        continue;
      } else if (testDate.getTime() === currentDate.getTime() - 86400000) { // 86400000 ms = 1 day
        // Previous day, increment streak
        streak++;
        currentDate = testDate;
      } else {
        // Gap in streak, stop counting
        break;
      }
    }

    // Add 1 to include the current day in the streak
    streak++;

    // Calculate statistics
    const totalTestsTaken = userTests.length;
    const totalQuestionsAnswered = userTests.reduce((sum, test) => sum + test.responses.length, 0);
    const totalScore = userTests.reduce((sum, test) => sum + (test.score || 0), 0);
    const averageTestScore = totalTestsTaken > 0 ? totalScore / totalTestsTaken : 0;
    const totalTimeSpent = userTests.reduce((sum, test) => 
      sum + test.responses.reduce((testSum, response) => testSum + (response.timeSpent || 0), 0), 0);
    const averageTimePerQuestion = totalQuestionsAnswered > 0 ? totalTimeSpent / totalQuestionsAnswered : 0;

    // Calculate total time spent on tests and average time per test
    const totalTestTime = userTests.reduce((sum, test) => {
      if (test.startedAt && test.finishedAt) {
        return sum + (new Date(test.finishedAt).getTime() - new Date(test.startedAt).getTime());
      }
      return sum;
    }, 0);

    // Calculate additional statistics
    const testsCompleted = userTests.filter(test => test.finishedAt !== null).length;
    const averageTimePerTest = testsCompleted > 0 ? totalTestTime / testsCompleted : 0;
    const completionRate = totalTestsTaken > 0 ? (testsCompleted / totalTestsTaken) * 100 : 0;

    // Group questions by category and calculate accuracy
    const categoryAccuracy = userTests.reduce((acc, test) => {
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
      testsCompleted,
      completionRate,
      totalQuestionsAnswered,
      averageTestScore,
      averageTimePerQuestion,
      averageTimePerTest: averageTimePerTest, 
      categoryAccuracy: categoryAccuracyPercentages,
      streak,
    });
  } catch (error) {
    console.error('Error generating user report:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
