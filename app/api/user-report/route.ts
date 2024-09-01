// app/api/user-report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all user tests and their responses
    const userTests = await prisma.userTest.findMany({
      where: { userId },
      include: {
        responses: true,
      },
    });

    // Calculate statistics
    const totalTestsTaken = userTests.length;
    const totalQuestionsAnswered = userTests.reduce((sum, test) => sum + test.responses.length, 0);
    const totalScore = userTests.reduce((sum, test) => sum + (test.score || 0), 0);
    const averageTestScore = totalTestsTaken > 0 ? totalScore / totalTestsTaken : 0;
    const totalTimeSpent = userTests.reduce((sum, test) => 
      sum + test.responses.reduce((testSum, response) => testSum + (response.timeSpent || 0), 0), 0);
    const averageTimePerQuestion = totalQuestionsAnswered > 0 ? totalTimeSpent / totalQuestionsAnswered : 0;

    // Calculate additional statistics
    const testsCompleted = userTests.filter(test => test.finishedAt !== null).length;
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
      totalTestsTaken,
      testsCompleted,
      completionRate,
      totalQuestionsAnswered,
      averageTestScore,
      averageTimePerQuestion,
      categoryAccuracy: categoryAccuracyPercentages,
    });
  } catch (error) {
    console.error('Error generating user report:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}