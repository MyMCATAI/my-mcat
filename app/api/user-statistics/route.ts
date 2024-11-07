// app/api/user-statistics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

// Add this interface at the top of the file, after the imports
interface CategoryMastery {
  [conceptCategory: string]: number;
}

export async function GET(req: NextRequest) {
  const { userId } = auth();
  console.log("Current User ID:", userId);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user info to get the score
    const userInfo = await prisma.userInfo.findUnique({
      where: { userId: "user_2jDyTOgTqrpgR5SdDfQt39zOsgj" },
      select: { score: true },
    });

    // Keep existing knowledge profiles fetch
    const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
      where: {
        userId: "user_2jDyTOgTqrpgR5SdDfQt39zOsgj",
        conceptMastery: { not: null },
      },
      include: {
        category: {
          select: {
            id: true,
            conceptCategory: true,
            subjectCategory: true,
          },
        },
      },
    });

    console.log(
      "Knowledge Profiles raw data:",
      JSON.stringify(knowledgeProfiles, null, 2)
    );

    console.log("Fetched Knowledge Profiles:", knowledgeProfiles);

    // Update userTests fetch to match user-report
    const userTests = await prisma.userTest.findMany({
      where: {
        userId: "user_2jDyTOgTqrpgR5SdDfQt39zOsgj",
      },
      include: {
        responses: true,
      },
      orderBy: {
        startedAt: "asc",
      },
    });

    // Keep existing calendar activities fetch
    const calendarActivities = await prisma.calendarActivity.findMany({
      where: {
        userId: "user_2jDyTOgTqrpgR5SdDfQt39zOsgj",
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

    const categoryMasteryData: CategoryMastery = {};

    for (const profile of knowledgeProfiles) {
      console.log("Profile data:", {
        categoryId: profile.categoryId,
        conceptMastery: profile.conceptMastery,
        category: profile.category,
      });

      if (profile.category && profile.conceptMastery !== null) {
        const categoryName = profile.category.conceptCategory;
        categoryMasteryData[categoryName] = profile.conceptMastery;
        console.log(
          `Added mastery for ${categoryName}:`,
          profile.conceptMastery
        );
      }
    }

    console.log("Final categoryMasteryData:", categoryMasteryData);

    const testScores = userTests.map((test) => ({
      date: test.startedAt,
      score: test.score,
      finishedAt: test.finishedAt,
    }));

    // Sort by date
    const aggregatedTestScores = testScores.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

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
    ); // Keep in milliseconds for now

    const totalQuestionsAnswered = completedTests.reduce(
      (sum, test) => sum + test.responses.length,
      0
    );

    const averageTimePerQuestion =
      totalQuestionsAnswered > 0
        ? totalTimeSpent / 1000 / totalQuestionsAnswered
        : 0;

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
      totalTestsTaken > 0 ? totalTestTime / 60000 / totalTestsTaken : 0; // Convert to minutes first, then divide by tests

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

    // Add after fetching knowledge profiles
    const knowledgeProfilesWithScores = knowledgeProfiles
      .filter((profile) => profile.conceptMastery !== null)
      .map((profile) => ({
        categoryName: profile.category.conceptCategory,
        subjectCategory: profile.category.subjectCategory,
        conceptMastery: profile.conceptMastery || 0,
      }))
      .sort((a, b) => b.conceptMastery - a.conceptMastery);

    const topProfiles = knowledgeProfilesWithScores.slice(0, 3);
    const bottomProfiles = knowledgeProfilesWithScores.slice(-3).reverse();

    const strongestProfile = knowledgeProfilesWithScores[0] || null;
    const weakestProfile =
      knowledgeProfilesWithScores[knowledgeProfilesWithScores.length - 1] ||
      null;

    const statisticsData = {
      userScore: userInfo?.score || 0,
      conceptMastery: categoryMasteryData,
      testScores: testScores,
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
      strongestProfile,
      weakestProfile,
      topProfiles,
      bottomProfiles,
      knowledgeProfiles: knowledgeProfiles.map((profile) => ({
        categoryName: profile.category.conceptCategory,
        subjectCategory: profile.category.subjectCategory,
        conceptMastery: profile.conceptMastery || 0,
      })),
    };

    console.log("API Response - Full Statistics:", statisticsData);
    console.log("Study Hours by Subject:", statisticsData.studyHoursBySubject);
    console.log("Category Accuracy:", statisticsData.categoryAccuracy);
    console.log("Subject Mastery:", statisticsData.conceptMastery);
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
