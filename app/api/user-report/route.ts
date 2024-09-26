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

    // Initialize variables for streak calculation
    let streaks: number[] = [];
    let currentStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day

    for (const test of userTests) {
      const testDate = new Date(test.startedAt);
      testDate.setHours(0, 0, 0, 0); // Set to start of day

      const dayDifference = (currentDate.getTime() - testDate.getTime()) / 86400000;

      if (dayDifference === 0) {
        // Same day, continue to next test
        continue;
      } else if (dayDifference === 1) {
        // Previous day, increment streak
        currentStreak++;
        currentDate = testDate;
      } else {
        // Gap in streak, save current streak and start a new one
        if (currentStreak > 0) {
          streaks.push(currentStreak);
        }
        currentStreak = 1; // Start a new streak
        currentDate = testDate;
      }
    }

    // Add the final streak
    if (currentStreak > 0) {
      streaks.push(currentStreak);
    }

    // Calculate the current streak (the first element in the streaks array)
    const currentStreakLength = streaks.length > 0 ? streaks[0] : 0;
    // Previous streak (if any)
    const previousStreakLength = streaks.length > 1 ? streaks[1] : 0;
    // Determine if the streak was recently broken
    const streakBrokenRecently = previousStreakLength > 0 && currentStreakLength < previousStreakLength;

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
      streak: currentStreakLength,
      previousStreak: previousStreakLength,
      streakBrokenRecently,
    });
  } catch (error) {
    console.error('Error generating user report:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
