import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { 
  getUserEmail, 
  updateUserStreak, 
  handleUserInactivity,
  sendStreakLossEmail,
  sendCoinLossWeekEmail,
  sendCoinGainEmail
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
    // Get the date 14 days ago (for two week check)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Get users who have been active in the last two weeks
    const users = await prisma.userInfo.findMany({
      where: {
        updatedAt: {
          gte: twoWeeksAgo
        },
        createdAt: {
          lt: twoWeeksAgo // Only check users who have been registered for at least 2 weeks
        }
      },
      select: {
        userId: true,
        streak: true,
        firstName: true,
        notificationPreference: true,
      },
    });

    console.log(`Found ${users.length} users active in the last two weeks`);

    let streakLossCount = 0;
    let weekOneCoinLossCount = 0;
    let weekTwoCoinGainCount = 0;
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

      // Check activity and handle streaks/coins
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

        // Handle weekly coin loss/gain emails
        if (activityStatus.weeklyInactivityStatus) {
          const { isFirstWeekInactive, isSecondWeekInactive, newScore } = activityStatus.weeklyInactivityStatus;

          // Send coin loss email after first week of inactivity
          if (isFirstWeekInactive && newScore !== undefined) {
            const sent = await sendCoinLossWeekEmail(email, name, newScore);
            if (sent) {
              weekOneCoinLossCount++;
              result.emailsSent.push('coin-loss-week');
              console.log(`✉️ Sent weekly coin loss email`);
            }
          }

          // Send encouragement email after two weeks of inactivity
          if (isSecondWeekInactive) {
            const sent = await sendCoinGainEmail(email, name);
            if (sent) {
              weekTwoCoinGainCount++;
              result.emailsSent.push('coin-gain');
              console.log(`✉️ Sent coin gain encouragement email`);
            }
          }
        }
      }

      console.log(`Status: ${activityStatus.wasActivePastDay ? '✅ Active' : '❌ Inactive'}`);
      console.log(`Streak: ${oldStreak} → ${newStreak}`);
      if (activityStatus.weeklyInactivityStatus?.newScore !== undefined) {
        console.log(`Score updated to: ${activityStatus.weeklyInactivityStatus.newScore}`);
      }
      console.log(`-------------------`);

      userResults.push(result);
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Time: ${now.toLocaleString()}`);
    console.log(`Total users processed: ${users.length}`);
    console.log(`Streak loss emails sent: ${streakLossCount}`);
    console.log(`Week 1 coin loss emails sent: ${weekOneCoinLossCount}`);
    console.log(`Week 2 encouragement emails sent: ${weekTwoCoinGainCount}`);
    console.log("=============\n");

    return NextResponse.json({ 
      message: "Cron job completed successfully",
      timestamp: now,
      paidUsersProcessed: users.length,
      streakLossEmails: streakLossCount,
      weekOneCoinLossEmails: weekOneCoinLossCount,
      weekTwoCoinGainEmails: weekTwoCoinGainCount,
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
