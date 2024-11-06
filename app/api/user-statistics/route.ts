// app/api/user-statistics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  console.log("Current User ID:", userId);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user info to get the score
    const userInfo = await prisma.userInfo.findUnique({
      where: { userId },
      select: { score: true },
    });

    // Keep existing knowledge profiles fetch
    const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
      where: { userId },
      include: {
        category: true,
      },
    });

    // Update userTests fetch to match user-report
    const userTests = await prisma.userTest.findMany({
      where: {
        userId,
      },
      include: {
        responses: true,
      },
      orderBy: {
        startedAt: "desc",
      },
      take: 5,
    });

    // Keep existing calendar activities fetch
    const calendarActivities = await prisma.calendarActivity.findMany({
      where: {
        userId,
      },
      select: {
        hours: true,
        scheduledDate: true,
        status: true,
        category: {
          select: {
            subjectCategory: true,
          },
        },
      },
    });

    // Filter completed tests (from user-report)
    const completedTests = userTests.filter((test) => test.finishedAt !== null);

    // Calculate streak (from user-report)
    let streaks: number[] = [];
    let currentStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const test of userTests) {
      const testDate = new Date(test.startedAt);
      testDate.setHours(0, 0, 0, 0);

      const dayDifference =
        (currentDate.getTime() - testDate.getTime()) / 86400000;

      if (dayDifference === 0) {
        continue;
      } else if (dayDifference === 1) {
        currentStreak++;
        currentDate = testDate;
      } else {
        if (currentStreak > 0) {
          streaks.push(currentStreak);
        }
        currentStreak = 1;
        currentDate = testDate;
      }
    }

    if (currentStreak > 0) {
      streaks.push(currentStreak);
    }

    const currentStreakLength = streaks.length > 0 ? streaks[0] : 0;
    const previousStreakLength = streaks.length > 1 ? streaks[1] : 0;
    const streakBrokenRecently =
      previousStreakLength > 0 && currentStreakLength < previousStreakLength;

    // After fetching knowledge profiles
    console.log("Raw Knowledge Profiles:", knowledgeProfiles);

    // Before subject mastery calculation
    console.log(
      "Starting subject mastery calculation with profiles:",
      knowledgeProfiles.map((profile) => ({
        subject: profile.category?.subjectCategory,
        weight: profile.category?.generalWeight,
        mastery: profile.conceptMastery,
        categoryId: profile.categoryId,
      }))
    );

    const subjectMastery = knowledgeProfiles.reduce((acc, profile) => {
      console.log("Processing profile:", {
        subject: profile.category?.subjectCategory,
        weight: profile.category?.generalWeight,
        mastery: profile.conceptMastery,
      });

      const subject = profile.category.subjectCategory;
      const weight = profile.category.generalWeight;
      const mastery = profile.conceptMastery || 0;

      if (!acc[subject]) {
        acc[subject] = {
          totalWeightedMastery: 0,
          totalWeight: 0,
        };
      }

      acc[subject].totalWeightedMastery += mastery * weight;
      acc[subject].totalWeight += weight;

      console.log("Accumulator state for subject:", subject, acc[subject]);

      return acc;
    }, {} as Record<string, { totalWeightedMastery: number; totalWeight: number }>);

    console.log("Raw subject mastery calculation:", subjectMastery);

    const subjectMasteryPercentages = Object.entries(subjectMastery).reduce(
      (acc, [subject, data]) => {
        acc[subject] = data.totalWeightedMastery / data.totalWeight;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(
      "Final subject mastery percentages:",
      subjectMasteryPercentages
    );

    const testScores = userTests.map((test) => ({
      date: test.startedAt,
      score: test.score || 0,
    }));

    // Calculate additional statistics from user-report
    const totalTestsTaken = userTests.length;
    const totalScore = completedTests.reduce(
      (sum, test) => sum + (test.score || 0),
      0
    );
    const averageTestScore =
      totalTestsTaken > 0 ? totalScore / completedTests.length : 0;

    const totalTimeSpent = completedTests.reduce(
      (sum, test) =>
        sum +
        test.responses.reduce(
          (testSum, response) => testSum + (response.timeSpent || 0),
          0
        ),
      0
    );

    const totalQuestionsAnswered = completedTests.reduce(
      (sum, test) => sum + test.responses.length,
      0
    );

    const averageTimePerQuestion =
      totalQuestionsAnswered > 0 ? totalTimeSpent / totalQuestionsAnswered : 0;

    const totalTestTime = completedTests.reduce((sum, test) => {
      if (test.startedAt && test.finishedAt) {
        return (
          sum +
          (new Date(test.finishedAt).getTime() -
            new Date(test.startedAt).getTime())
        );
      }
      return sum;
    }, 0);

    const averageTimePerTest =
      totalTestsTaken > 0 ? totalTestTime / totalTestsTaken : 0;

    // Keep existing study hours calculation
    const studyHoursBySubject = calendarActivities.reduce((acc, activity) => {
      const subject = activity.category?.subjectCategory || "Other";
      acc[subject] = (acc[subject] || 0) + activity.hours;
      return acc;
    }, {} as Record<string, number>);

    // Calculate category accuracy from user-report
    const categoryAccuracy = completedTests.reduce((acc, test) => {
      test.responses.forEach((response) => {
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

    const categoryAccuracyPercentages = Object.entries(categoryAccuracy).reduce(
      (acc, [categoryId, data]) => {
        acc[categoryId] = (data.correct / data.total) * 100;
        return acc;
      },
      {} as Record<string, number>
    );

    // Add before the return statement (around line 180)
    const totalTasks = calendarActivities.length;
    const completedTasks = calendarActivities.filter(
      (activity) => activity.status === "Completed"
    ).length;

    const statisticsData = {
      userScore: userInfo?.score || 0,
      subjectMastery: subjectMasteryPercentages,
      testScores,
      averageTimePerQuestion,
      totalQuestionsAnswered,
      averageCorrect:
        totalQuestionsAnswered > 0
          ? (completedTests.reduce(
              (sum, test) =>
                sum + test.responses.filter((r) => r.isCorrect).length,
              0
            ) /
              totalQuestionsAnswered) *
            100
          : 0,
      studyHoursBySubject,
      totalTestsTaken,
      testsCompleted: completedTests.length,
      completionRate:
        totalTestsTaken > 0
          ? (completedTests.length / totalTestsTaken) * 100
          : 0,
      averageTestScore,
      averageTimePerTest,
      categoryAccuracy: categoryAccuracyPercentages,
      streak: currentStreakLength,
      previousStreak: previousStreakLength,
      streakBrokenRecently,
      totalTasks,
      completedTasks,
    };

    console.log("API Response - Full Statistics:", statisticsData);
    console.log("Study Hours by Subject:", statisticsData.studyHoursBySubject);
    console.log("Category Accuracy:", statisticsData.categoryAccuracy);
    console.log("Subject Mastery:", statisticsData.subjectMastery);
    console.log("Test Scores:", statisticsData.testScores);
    console.log("Time Metrics:", {
      averageTimePerQuestion: statisticsData.averageTimePerQuestion,
      averageTimePerTest: statisticsData.averageTimePerTest,
    });
    console.log("Performance Metrics:", {
      totalQuestionsAnswered: statisticsData.totalQuestionsAnswered,
      averageCorrect: statisticsData.averageCorrect,
      totalTestsTaken: statisticsData.totalTestsTaken,
      testsCompleted: statisticsData.testsCompleted,
      completionRate: statisticsData.completionRate,
      averageTestScore: statisticsData.averageTestScore,
    });
    console.log("Streak Information:", {
      currentStreak: statisticsData.streak,
      previousStreak: statisticsData.previousStreak,
      streakBrokenRecently: statisticsData.streakBrokenRecently,
    });
    console.log("Calendar Activity Statistics:", {
      totalTasks: statisticsData.totalTasks,
      completedTasks: statisticsData.completedTasks,
    });

    return NextResponse.json(statisticsData);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
