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
export const fetchCache = 'force-no-store'

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const now = new Date();
  console.log(`Starting inactivity check cron job at ${now.toLocaleString()}`);

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("Unauthorized request received");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Get the date 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get the date 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Get paid users who have been active in the last week AND were created more than 24 hours ago
    const users = await prisma.userInfo.findMany({
      where: {
        hasPaid: true,
        updatedAt: {
          gte: oneWeekAgo
        },
        createdAt: {
          lt: oneDayAgo // This ensures the user was created more than 24 hours ago
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

    let streakLossCount = 0;
    let coinLossCount = 0;
    const userResults = [];

    // Process each user
    for (const user of users) {
      const name = user.firstName || "Future Doctor";
      const email = await getUserEmail(user.userId);
      
      if (!email) {
        console.log(`⚠️ Failed to fetch email for user ID: ${user.userId}`);
        continue;
      }

      console.log(`\n-------------------`);
      console.log(`Processing user: ${name} (${email})`);

      // Check activity and handle streaks/scores
      const activityStatus = await handleUserInactivity(user.userId);
      
      // Update streak based on past day activity
      const oldStreak = user.streak;
      const newStreak = await updateUserStreak(user.userId, activityStatus.wasActivePastDay);

      const result = {
        userId: user.userId,
        name,
        email,
        wasActive: activityStatus.wasActivePastDay,
        oldStreak,
        newStreak,
        coinLoss: activityStatus.isFirstCoinLoss,
        newScore: activityStatus.newScore,
        emailsSent: [] as string[]
      };
      
      // Only send emails if notificationPreference is "all"
      if (user.notificationPreference === "all") {
        // Send streak loss email if they just lost their streak
        if (!activityStatus.wasActivePastDay && oldStreak > 0 && newStreak === 0) {
          const sent = await sendStreakLossEmail(email, name);
          if (sent) {
            streakLossCount++;
            result.emailsSent.push('streak-loss');
            console.log(`✉️ Sent streak loss email`);
          }
        }

        // Send coin loss email only on first coin loss
        if (activityStatus.isFirstCoinLoss && activityStatus.newScore !== undefined) {
          const sent = await sendCoinLossEmail(email, name, activityStatus.newScore);
          if (sent) {
            coinLossCount++;
            result.emailsSent.push('coin-loss');
            console.log(`✉️ Sent coin loss email`);
          }
        }
      }

      console.log(`Status: ${activityStatus.wasActivePastDay ? '✅ Active' : '❌ Inactive'}`);
      console.log(`Streak: ${oldStreak} → ${newStreak}`);
      if (activityStatus.newScore !== undefined) {
        console.log(`Score updated to: ${activityStatus.newScore}`);
      }
      console.log(`-------------------`);

      userResults.push(result);
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Time: ${now.toLocaleString()}`);
    console.log(`Total users processed: ${users.length}`);
    console.log(`Streak loss emails sent: ${streakLossCount}`);
    console.log(`Coin loss emails sent: ${coinLossCount}`);
    console.log("=============\n");

    return NextResponse.json({ 
      message: "Cron job completed successfully",
      timestamp: now,
      paidUsersProcessed: users.length,
      streakLossEmails: streakLossCount,
      coinLossEmails: coinLossCount,
      details: userResults
    });

  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
