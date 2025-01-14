'use server';

import { emailService } from "@/services/email/EmailService";
import { clerkClient } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserEmail(userId: string) {
  try {
    const user = await clerkClient().users.getUser(userId);
    return user.emailAddresses[0].emailAddress;
  } catch (error) {
    console.error("Error fetching user email:", userId);
    return null;
  }
}

export async function getUserIdByEmail(email: string) {
  try {
    const users = await clerkClient().users.getUserList({
      emailAddress: [email],
    });
    
    if (users.totalCount>0) {
      return users.data[0].id // return the id of the first user found
    }
    return null;
  } catch (error) {
    console.error("Error fetching user by email:", email);
    return null;
  }
}

async function isBreakDay(userId: string, date: Date): Promise<boolean> {
  // Get most recent study plan
  const studyPlan = await prisma.studyPlan.findFirst({
    where: { userId },
    orderBy: { creationDate: 'desc' }
  });

  if (!studyPlan) return false;

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[dayOfWeek];

  // Parse hoursPerDay JSON and check if it's a break day (0 hours)
  const hoursPerDay = studyPlan.hoursPerDay as Record<string, string>;
  return hoursPerDay[dayName] === "0";
}

export async function checkUserActivity(userId: string, daysToCheck: number = 1): Promise<boolean> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToCheck);

  // If checking past day activity and it's a break day, return true
  if (daysToCheck === 1 && await isBreakDay(userId, cutoffDate)) {
    return true;
  }

  // Check calendar activities
  const recentActivities = await prisma.calendarActivity.findMany({
    where: {
      userId: userId,
      scheduledDate: {
        lte: new Date(),
        gte: cutoffDate
      }
    }
  });

  // Check if any calendar activities were updated
  const hasCalendarActivity = recentActivities.some(activity => activity.updatedAt > cutoffDate);

  if (hasCalendarActivity) {
    return true;
  }

  // Check user responses from the past day
  const recentResponses = await prisma.userResponse.findMany({
    where: {
      userId: userId,
      answeredAt: {
        gte: cutoffDate
      }
    },
    take: 1
  });

  return recentResponses.length > 0;
}

export async function updateUserStreak(userId: string, wasActive: boolean): Promise<number> {
  if (wasActive) {
    // If active, increment or maintain streak
    const user = await prisma.userInfo.findUnique({
      where: { userId },
      select: { streak: true }
    });
    
    // Increment streak if it exists, or start at 1
    const newStreak = (user?.streak || 0) + 1;
    
    await prisma.userInfo.update({
      where: { userId },
      data: { streak: newStreak }
    });

    return newStreak;
  } else {
    // If inactive, reset streak to 0
    await prisma.userInfo.update({
      where: { userId },
      data: { streak: 0 }
    });
    return 0;
  }
}

export async function handleUserInactivity(userId: string): Promise<{ 
  wasActivePastDay: boolean;
  weeklyInactivityStatus?: {
    isFirstWeekInactive: boolean;
    isSecondWeekInactive: boolean;
    newScore?: number;
  };
}> {
  // Check activity for past day (for streak)
  const wasActivePastDay = await checkUserActivity(userId, 1);
  
  // Check activity for past week
  const wasActivePastWeek = await checkUserActivity(userId, 7);
  // Check activity for past two weeks
  const wasActivePastTwoWeeks = await checkUserActivity(userId, 14);

  // Only proceed with coin deduction if user was inactive for a week
  if (!wasActivePastWeek) {
    const user = await prisma.userInfo.findUnique({
      where: { userId },
      select: { score: true }
    });

    if (user) {
      // Deduct 5 coins if this is the first week of inactivity
      const newScore = Math.max(5, user.score - 5);
      await prisma.userInfo.update({
        where: { userId },
        data: { score: newScore }
      });

      return {
        wasActivePastDay,
        weeklyInactivityStatus: {
          isFirstWeekInactive: true,
          isSecondWeekInactive: !wasActivePastTwoWeeks,
          newScore
        }
      };
    }
  }
  
  return { 
    wasActivePastDay,
    weeklyInactivityStatus: {
      isFirstWeekInactive: false,
      isSecondWeekInactive: !wasActivePastTwoWeeks
    }
  };
}

export async function sendWelcomeEmail(userName: string, userEmail: string): Promise<boolean> {
  try {
    const result = await emailService.sendEmail({
      to: userEmail,
      template: "welcome",
      data: { userName }
    });
    
    return result.success;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}

export async function sendReferralEmail(referrerName: string, friendEmail: string): Promise<boolean> {
    try {
      const result = await emailService.sendEmail({
        to: friendEmail,
        template: 'referral',
        data: { referrerName }
      });
      
      return result.success;
    } catch (error) {
      console.error('Error sending referral email:', error);
      return false;
    }
  }

export async function sendStreakLossEmail(email: string, userName?: string): Promise<boolean> {
  try {
    const result = await emailService.sendEmail({
      to: email,
      template: 'streak-loss',
      data: { userName: userName || "Future Doctor" },
      useReminderEmail: false
    });
    return result.success;
  } catch (error) {
    console.error("Error sending streak loss email:", error);
    return false;
  }
}

export async function sendReminderEmail(email: string, name: string, pendingGoals?: string): Promise<boolean> {
  try {
    const result = await emailService.sendEmail({
      to: email,
      template: 'daily-reminder',
      data: { name, pendingGoals },
      useReminderEmail: true
    });
    return result.success;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return false;
  }
}


export async function sendWeeklyReportEmail(
  email: string,
  data: {
    userName: string;
    dailyActivity: Array<{ name: string; completed: boolean }>;
    currentCoins: number
    topicsCovered: string[];
    practiceProblems: number;
    flashcardsReviewed: number;
    topicsReviewed: number;
    improvements: string[];
    focusAreas: string[];
    dashboardUrl: string;
    settingsUrl: string;
    totalPatientsCount: number;
  }
): Promise<boolean> {
  try {
    const result = await emailService.sendEmail({
      to: email,
      template: 'weekly-report',
      data,
      useReminderEmail: false
    });
    return result.success;
  } catch (error) {
    console.error("Error sending weekly report email:", error);
    return false;
  }
}

export async function sendCoinLossWeekEmail(email: string, userName: string, remainingCoins: number): Promise<boolean> {
  try {
    const result = await emailService.sendEmail({
      to: email,
      template: 'coin-loss-week',
      data: { userName, remainingCoins },
      useReminderEmail: false
    });
    return result.success;
  } catch (error) {
    console.error("Error sending weekly coin loss email:", error);
    return false;
  }
}

export async function sendCoinGainEmail(email: string, userName: string): Promise<boolean> {
  try {
    const result = await emailService.sendEmail({
      to: email,
      template: 'coin-gain',
      data: { userName },
      useReminderEmail: false
    });
    return result.success;
  } catch (error) {
    console.error("Error sending coin gain email:", error);
    return false;
  }
}

export async function sendCoinLossDayEmail(email: string, userName: string, remainingCoins: number): Promise<boolean> {
  try {
    const result = await emailService.sendEmail({
      to: email,
      template: 'coin-loss-day',
      data: { userName, remainingCoins },
      useReminderEmail: false
    });
    return result.success;
  } catch (error) {
    console.error("Error sending daily coin loss email:", error);
    return false;
  }
}