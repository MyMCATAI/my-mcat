import { PrismaClient } from "@prisma/client";
import { startOfWeek, endOfWeek } from "date-fns";
import { categoryMapping } from '@/constants/categoryMappings';

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
}

export async function generateWeeklyReport(userId: string): Promise<WeeklyReportData> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

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
      .map(code => categoryMapping[code] || code)
  )];

  // Identify improvements based on recent performance trends
  const improvements = [];
  if (weeklyResponses.length > 0) improvements.push("Regular practice");
  if (averageTestScore > 70) improvements.push("Strong test performance");
  if (flashcardsReviewed > 20) improvements.push("Consistent flashcard review");

  // Get user's current coin balance
  const userInfo = await prisma.userInfo.findUnique({
    where: { userId },
    select: { score: true }
  });

  // Get patient record count
  const patientRecord = await prisma.patientRecord.findUnique({
    where: { userId }
  });

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
    totalPatientsCount: patientRecord?.patientsTreated || 0
  };
} 