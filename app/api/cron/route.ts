import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserEmail, updateUserStreak, handleUserInactivity } from "@/lib/server-utils";

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();


// Cron job to handle user inactivity and streak updates
// - Check if user was active in the past day
// - Update streak
// - Update score if user was inactive for 2 days

export async function GET(request: NextRequest) {
  try {
    // Get all paid users from the database
    const users = await prisma.userInfo.findMany({
      where: {
        hasPaid: true
      },
      select: {
        userId: true,
        streak: true,
        score: true,
      },
    });

    console.log(`Found ${users.length} paid users`);

    const failedEmailFetches: string[] = [];
    const successfulEmailFetches: { userId: string; email: string }[] = [];
    const streakUpdates: { userId: string; oldStreak: number; newStreak: number }[] = [];
    const scoreUpdates: { userId: string; oldScore: number; newScore: number }[] = [];

    // Process each user
    for (const user of users) {
      // Check email
      const email = await getUserEmail(user.userId);
      if (email === null) {
        failedEmailFetches.push(user.userId);
        console.error(`Failed to fetch email for user ID: ${user.userId}`);
      } else {
        successfulEmailFetches.push({ userId: user.userId, email });
      }

      // Check activity and handle streaks/scores
      const activityStatus = await handleUserInactivity(user.userId);
      
      // Update streak based on past day activity
      const oldStreak = user.streak;
      const newStreak = await updateUserStreak(user.userId, activityStatus.wasActivePastDay);
      
      streakUpdates.push({
        userId: user.userId,
        oldStreak,
        newStreak
      });

      // Track score updates if user was inactive for 2 days
      if (activityStatus.wasInactiveTwoDays && activityStatus.newScore !== undefined) {
        scoreUpdates.push({
          userId: user.userId,
          oldScore: user.score,
          newScore: activityStatus.newScore
        });
        console.log(`User ${user.userId} lost a point for 2 days of inactivity. New score: ${activityStatus.newScore}`);
      }

      // Log activity status and streak changes
      if (!activityStatus.wasActivePastDay && oldStreak > 0) {
        console.log(`User ${user.userId} lost their streak of ${oldStreak} days. Should send email notification.`);
      } else if (activityStatus.wasActivePastDay) {
        console.log(`User ${user.userId} maintained/increased streak to ${newStreak} days`);
      }
    }

    // Log success and return response
    const now = new Date();
    console.log("Cron job completed at:", now);
    return NextResponse.json({ 
      message: "Cron job completed successfully",
      timestamp: now,
      paidUsersProcessed: users.length,
      successfulFetches: successfulEmailFetches.length,
      failedFetches: {
        count: failedEmailFetches.length,
        userIds: failedEmailFetches
      },
      streakUpdates: {
        total: streakUpdates.length,
        updates: streakUpdates
      },
      scoreUpdates: {
        total: scoreUpdates.length,
        updates: scoreUpdates
      }
    });

  } catch (error) {
    // Error handling
    console.error("Cron job failed:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions to implement:
// 1. processUserStreaks(user)
//    - Check user activity
//    - Update streak counts
//    - Return updated user data

// 2. sendReminderEmail(user)
//    - Generate reminder email content
//    - Send via email service

// 3. generateWeeklySummary(user)
//    - Compile weekly statistics
//    - Generate email content
//    - Send summary email

// 4. isUserActive(user)
//    - Check if user has been active in last 24h
//    - Return boolean