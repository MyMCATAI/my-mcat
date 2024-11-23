// app/api/user-statistics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

// Interface Definitions
interface CategoryMastery {
  [conceptCategory: string]: number;
}

interface DailyProgress {
  date: string;
  correct: number;
  total: number;
  accuracy: number;
}

interface PerformanceOverTime {
  date: string;
  cumulativeCorrect: number;
  cumulativeTotal: number;
  accuracy: number;
  averageTime: number;
}

interface CategoryStat {
  categoryId: string;
  subjectCategory: string;
  conceptCategory: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  mastery: number;
}

interface CategoryWithMastery {
  categoryId: string;
  name: string;
  subject: string;
  mastery: number;
}

export async function GET(req: NextRequest) {
  const { userId } = auth();
  const { searchParams } = new URL(req.url);
  const subjects = searchParams.get('subjects')?.split(',') || [];

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch categories for the requested subjects
    const categories = await prisma.category.findMany({
      where: {
        subjectCategory: subjects.length ? { in: subjects } : undefined,
      },
      select: {
        id: true,
        subjectCategory: true,
        conceptCategory: true,
      },
    });

    const categoryIds = categories.map(cat => cat.id);

    // Fetch knowledge profiles
    const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
      where: {
        userId,
        categoryId: { in: categoryIds },
        conceptMastery: { not: null },
      },
      select: {
        categoryId: true,
        conceptMastery: true,
      },
    });

    // Fetch user responses
    const userResponses = await prisma.userResponse.findMany({
      where: {
        userId,
        categoryId: { in: categoryIds },
      },
      select: {
        categoryId: true,
        isCorrect: true,
        timeSpent: true,
        answeredAt: true,
      },
      orderBy: {
        answeredAt: 'asc',
      },
    });

    // Calculate daily progress
    const dailyProgressMap = userResponses.reduce((acc: Record<string, DailyProgress>, response) => {
      const date = response.answeredAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, correct: 0, total: 0, accuracy: 0 };
      }
      acc[date].total++;
      if (response.isCorrect) {
        acc[date].correct++;
      }
      acc[date].accuracy = (acc[date].correct / acc[date].total) * 100;
      return acc;
    }, {});

    // Calculate per-category statistics
    const categoryStatsArray = categories.map(category => {
      const responses = userResponses.filter(r => r.categoryId === category.id);
      const correct = responses.filter(r => r.isCorrect).length;
      const total = responses.length;
      const avgTime = total > 0
        ? responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / total
        : 0;
      const accuracy = total > 0 ? (correct / total) * 100 : 0;
      const mastery = knowledgeProfiles.find(p => p.categoryId === category.id)?.conceptMastery || 0;

      return {
        categoryId: category.id,
        subjectCategory: category.subjectCategory,
        conceptCategory: category.conceptCategory,
        totalQuestions: total,
        correctAnswers: correct,
        accuracy,
        averageTime: avgTime,
        mastery,
      };
    });

    // Create categoryStats object with proper typing
    const categoryStats: Record<string, CategoryStat> = categoryStatsArray.reduce((acc, category) => {
      acc[category.categoryId] = category;
      return acc;
    }, {} as Record<string, CategoryStat>);

    // Sort categories for top and bottom 5
    const categoriesWithResponses = categoryStatsArray.filter(category => 
      category.totalQuestions > 0
    );

    const sortedCategories = [...categoriesWithResponses].sort((a, b) => {
      // Higher accuracy and shorter average time per question are better
      if (b.accuracy === a.accuracy) {
        return a.averageTime - b.averageTime;
      }
      return b.accuracy - a.accuracy;
    });

    const topCategories = sortedCategories.slice(0, 5);
    const bottomCategories = sortedCategories.slice(-5).reverse();

    // Performance over time
    const performanceOverTime: PerformanceOverTime[] = [];
    let cumulativeCorrect = 0;
    let cumulativeTotal = 0;
    let cumulativeTime = 0;

    userResponses.forEach(response => {
      cumulativeTotal++;
      if (response.isCorrect) {
        cumulativeCorrect++;
      }
      cumulativeTime += response.timeSpent || 0;
      const accuracy = (cumulativeCorrect / cumulativeTotal) * 100;
      const averageTime = cumulativeTime / cumulativeTotal;
      const date = response.answeredAt.toISOString().split('T')[0];

      performanceOverTime.push({
        date,
        cumulativeCorrect,
        cumulativeTotal,
        accuracy,
        averageTime,
      });
    });

    // Calculate subject-level statistics (existing code)
    const subjectStats = categories.reduce((acc: Record<string, any>, category) => {
      const subjectCat = category.subjectCategory;
      if (!acc[subjectCat]) {
        acc[subjectCat] = {
          totalQuestions: 0,
          correctAnswers: 0,
          averageTime: 0,
          averageMastery: 0,
          categories: [],
        };
      }
      
      const catStat = categoryStats[category.id];
      acc[subjectCat].categories.push(catStat);
      acc[subjectCat].totalQuestions += catStat.totalQuestions;
      acc[subjectCat].correctAnswers += catStat.correctAnswers;
      acc[subjectCat].averageTime += catStat.averageTime * catStat.totalQuestions;
      acc[subjectCat].averageMastery += catStat.mastery;
      
      return acc;
    }, {});

    // Finalize subject-level averages
    Object.keys(subjectStats).forEach(subject => {
      const stats = subjectStats[subject];
      stats.accuracy = stats.totalQuestions > 0 ? 
        (stats.correctAnswers / stats.totalQuestions) * 100 : 0;
      stats.averageTime = stats.totalQuestions > 0 ? 
        stats.averageTime / stats.totalQuestions : 0;
      stats.averageMastery = stats.categories.length > 0 ? 
        stats.averageMastery / stats.categories.length : 0;
    });

    // Calculate overall statistics (existing code)
    const overallStats = {
      totalQuestions: Object.values(subjectStats).reduce(
        (sum, subject) => sum + subject.totalQuestions, 
        0
      ),
      totalCorrect: Object.values(subjectStats).reduce(
        (sum, subject) => sum + subject.correctAnswers, 
        0
      ),
      averageTime: 0,
      accuracy: 0
    };

    // Calculate overall average time and accuracy
    if (overallStats.totalQuestions > 0) {
      overallStats.averageTime = userResponses.reduce(
        (sum, response) => sum + (response.timeSpent || 0), 
        0
      ) / overallStats.totalQuestions;
      
      overallStats.accuracy = (overallStats.totalCorrect / overallStats.totalQuestions) * 100;
    }

    // Inside the try block, after fetching knowledgeProfiles
    const categoriesWithMastery = categories.map(category => {
      const profile = knowledgeProfiles.find(p => p.categoryId === category.id);
      return {
        categoryId: category.id,
        name: category.conceptCategory,
        subject: category.subjectCategory,
        mastery: profile?.conceptMastery || 0
      };
    });

    const sortedCategoriesByMastery = categoriesWithMastery
      .sort((a, b) => b.mastery - a.mastery);

    return NextResponse.json({
      categoryStats,
      subjectStats,
      dailyProgress: Object.values(dailyProgressMap),
      overallStats,
      topCategories,
      bottomCategories,
      performanceOverTime,
      categoriesWithMastery: sortedCategoriesByMastery,
    });
    
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
