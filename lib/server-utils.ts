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

export async function checkUserActivity(userId: string, daysToCheck: number = 1): Promise<boolean> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToCheck);

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
  wasInactiveTwoDays: boolean;
  newScore?: number;
}> {
  // Check activity for past day (for streak)
  const wasActivePastDay = await checkUserActivity(userId, 1);
  
  // If active in past day, no need to check further
  if (wasActivePastDay) {
    return { wasActivePastDay: true, wasInactiveTwoDays: false };
  }

  // Check if inactive for 2 days
  const wasActivePastTwoDays = await checkUserActivity(userId, 2);
  
  if (!wasActivePastTwoDays) {
    // User has been inactive for 2 days, decrement score
    const user = await prisma.userInfo.findUnique({
      where: { userId },
      select: { score: true }
    });

    if (user) {
      const newScore = Math.max(5, user.score - 1); // Decrement score but keep minimum of 5
      await prisma.userInfo.update({
        where: { userId },
        data: { score: newScore }
      });

      return {
        wasActivePastDay: false,
        wasInactiveTwoDays: true,
        newScore
      };
    }
  }

  return {
    wasActivePastDay: false,
    wasInactiveTwoDays: !wasActivePastTwoDays
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

  