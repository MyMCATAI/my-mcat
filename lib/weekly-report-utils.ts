import { PrismaClient } from "@prisma/client";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { mymcatTopicsMapping } from '@/constants/topics';

const prisma = new PrismaClient();

export interface WeeklyReportData {
  dailyActivity: { name: string; completed: boolean }[];
  currentCoins: number;
  topicsCovered: string[];
  practiceProblems: number;
  flashcardsReviewed: number;
  topicsReviewed: number;
  improvements: string[];
  focusAreas: string[];
  accuracy: Record<string, number>;
  testScores: number[];
  averageTestScore: number;
  totalTimeSpent: number;
  totalPatientsCount: number;
  testsCompleted: number;
  completedActivities: number;
  studyCompletionRate: number;
  topPerformingSubjects: string[];
}

interface WeeklyPerformanceMetrics {
  testsCompleted: number;
  averageTestScore: number;
  completedActivities: number;
  studyCompletionRate: number;
  topPerformingSubjects: string[];
}

async function getWeeklyPerformanceMetrics(userId: string, oneWeekAgo: Date): Promise<WeeklyPerformanceMetrics> {
  // Get weekly test performance
  const weeklyTests = await prisma.userTest.findMany({
    where: {
      userId,
      startedAt: {
        gte: oneWeekAgo
      },
      finishedAt: {
        not: null
      }
    }
  });

  const testsCompleted = weeklyTests.length;
  const averageTestScore = testsCompleted > 0
    ? weeklyTests.reduce((sum, test) => sum + (test.score || 0), 0) / testsCompleted
    : 0;

  // Get weekly study activities
  const weeklyActivities = await prisma.calendarActivity.findMany({
    where: {
      userId,
      scheduledDate: {
        gte: oneWeekAgo,
        lte: new Date(),
      },
    }
  });

  const completedActivities = weeklyActivities.filter(activity => activity.status === "Complete").length;
  const totalActivities = weeklyActivities.length;
  const studyCompletionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  // Get top 3 performing subjects
  const topSubjects = await prisma.knowledgeProfile.findMany({
    where: {
      userId,
      totalAttempts: {
        gt: 0 // Only include subjects they've actually worked on
      }
    },
    orderBy: {
      conceptMastery: 'desc'
    },
    take: 3,
    include: {
      category: true
    }
  });

  const topPerformingSubjects = topSubjects
    .filter(subject => subject.category?.conceptCategory)
    .map(subject => subject.category.conceptCategory);

  return {
    testsCompleted,
    averageTestScore,
    completedActivities,
    studyCompletionRate: Math.round(studyCompletionRate),
    topPerformingSubjects
  };
}

export async function generateWeeklyReport(userId: string): Promise<WeeklyReportData> {
  const now = new Date();
  const weekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
  const oneWeekAgo = subWeeks(now, 1);

  // Get user responses from the past week
  const weeklyResponses = await prisma.userResponse.findMany({
    where: {
      userId,
      answeredAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    include: {
      question: {
        select: {
          types: true,
          categoryId: true,
        },
      },
      Category: {
        select: {
          contentCategory: true,
          conceptCategory: true,
        },
      },
    },
  });

  // Get calendar activities from the past week
  const weeklyActivities = await prisma.calendarActivity.findMany({
    where: {
      userId,
      scheduledDate: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    include: {
      category: true,
    },
  });

  // Get user tests from the past week
  const weeklyTests = await prisma.userTest.findMany({
    where: {
      userId,
      startedAt: {
        gte: weekStart,
        lte: weekEnd,
      },
      finishedAt: {
        not: null,
      },
    },
  });

  // Calculate daily activity
  const dailyActivityMap = new Map<string, boolean>();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  weeklyResponses.forEach(response => {
    const day = days[response.answeredAt.getDay()];
    dailyActivityMap.set(day, true);
  });

  const dailyActivity = days.map(day => ({
    name: day,
    completed: dailyActivityMap.get(day) || false,
  }));

  // Calculate category accuracy and identify focus areas
  const categoryStats = new Map<string, { correct: number; total: number; conceptCategory?: string }>();

  weeklyResponses.forEach(response => {
    if (response.categoryId) {
      if (!categoryStats.has(response.categoryId)) {
        categoryStats.set(response.categoryId, {
          correct: 0,
          total: 0,
          conceptCategory: response.Category?.conceptCategory
        });
      }
      const stats = categoryStats.get(response.categoryId)!;
      stats.total++;
      if (response.isCorrect) stats.correct++;
    }
  });

  const accuracy: Record<string, number> = {};
  const focusAreas: string[] = [];

  categoryStats.forEach((stats, categoryId) => {
    const accuracyRate = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    accuracy[categoryId] = accuracyRate;
    if (stats.total >= 3 && accuracyRate < 70 && stats.conceptCategory) {
      focusAreas.push(stats.conceptCategory);
    }
  });

  // Calculate test scores and averages
  const testScores = weeklyTests.map(test => test.score || 0);
  const averageTestScore = testScores.length > 0
    ? testScores.reduce((a, b) => a + b, 0) / testScores.length
    : 0;

  // Calculate total time spent
  const totalTimeSpent = weeklyResponses.reduce((sum, response) =>
    sum + (response.timeSpent || 0), 0);

  // Count different question types
  const flashcardsReviewed = weeklyResponses.filter(
    response => response.question.types?.includes('flashcard')
  ).length;

  // Get unique topics covered
  const topicsCovered = [...new Set(
    weeklyResponses
      .filter(r => r.Category?.contentCategory)
      .map(r => r.Category!.contentCategory)
      .flatMap(code => (mymcatTopicsMapping)[code] || [code])
  )];

  // Identify improvements based on recent performance trends
  const improvements = [];
  if (weeklyResponses.length > 0) improvements.push("Regular practice");
  if (averageTestScore > 70) improvements.push("Strong test performance");
  if (flashcardsReviewed > 20) improvements.push("Consistent flashcard review");

  // Get user's current coin balance and patient count
  const userInfo = await prisma.userInfo.findUnique({
    where: { userId },
    include: {
      patientRecord: true
    }
  });

  // Get weekly performance metrics
  const performanceMetrics = await getWeeklyPerformanceMetrics(userId, oneWeekAgo);

  return {
    dailyActivity,
    currentCoins: userInfo?.score || 0,
    topicsCovered,
    practiceProblems: weeklyResponses.length,
    flashcardsReviewed,
    topicsReviewed: topicsCovered.length,
    improvements,
    focusAreas: [...new Set(focusAreas)],
    accuracy,
    testScores,
    averageTestScore,
    totalTimeSpent,
    totalPatientsCount: userInfo?.patientRecord?.patientsTreated || 0,
    testsCompleted: performanceMetrics.testsCompleted,
    completedActivities: performanceMetrics.completedActivities,
    studyCompletionRate: performanceMetrics.studyCompletionRate,
    topPerformingSubjects: performanceMetrics.topPerformingSubjects
  };
} 