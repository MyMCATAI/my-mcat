import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { 
  getUserEmail, 
  updateUserStreak, 
  handleUserInactivity,
  sendStreakLossEmail,
  sendCoinLossEmail 
} from "@/lib/server-utils";

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();


// Cron job to handle user inactivity and streak updates
// - Check if user was active in the past day
// - Update streak
// - Update score if user was inactive for 2 days

export async function GET(request: NextRequest) {

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    // Get the date 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get paid users who have been active in the last week
    const users = await prisma.userInfo.findMany({
      where: {
        hasPaid: true,
        updatedAt: {
          gte: oneWeekAgo
        }
      },
      select: {
        userId: true,
        streak: true,
        score: true,
        firstName: true,
        notificationPreference: true,
      },
    });

    console.log(`Found ${users.length} paid users active in the last week`);

    // Process each user
    for (const user of users) {
      // Get email
      const name = user.firstName || "Future Doctor"
      const email = await getUserEmail(user.userId);
      if (!email) {
        console.error(`Failed to fetch email for user ID: ${user.userId}`);
        continue;
      }

      // Check activity and handle streaks/scores
      const activityStatus = await handleUserInactivity(user.userId);
      
      // Update streak based on past day activity
      const oldStreak = user.streak;
      const newStreak = await updateUserStreak(user.userId, activityStatus.wasActivePastDay);
      
      // Only send emails if notificationPreference is "all"
      if (user.notificationPreference === "all") {
        // Send streak loss email if they just lost their streak
        if (!activityStatus.wasActivePastDay && oldStreak > 0 && newStreak === 0) {
          await sendStreakLossEmail(email, name);
          console.log(`Sent streak loss email to user ${user.userId}`);
        }

        // Send coin loss email only on first coin loss
        if (activityStatus.isFirstCoinLoss && 
            activityStatus.newScore !== undefined) {
          await sendCoinLossEmail(
            email, 
            name, 
            activityStatus.newScore
          );
          console.log(`Sent coin loss email to user ${user.userId}`);
        }
      }
    }

    // Log success and return response
    const now = new Date();
    console.log("Cron job completed at:", now);
    return NextResponse.json({ 
      message: "Cron job completed successfully",
      timestamp: now,
      paidUsersProcessed: users.length
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