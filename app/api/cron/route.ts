import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { 
  getUserEmail, 
  updateUserStreak, 
  handleUserInactivity,
  sendStreakLossEmail
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

    // Get users who have been active in the last week AND were created more than 24 hours ago
    const users = await prisma.userInfo.findMany({
      where: {
        updatedAt: {
          gte: oneWeekAgo
        },
        createdAt: {
          lt: oneDayAgo
        }
      },
      select: {
        userId: true,
        streak: true,
        firstName: true,
        notificationPreference: true,
      },
    });

    console.log(`Found ${users.length} users active in the last week`);

    let streakLossCount = 0;
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

      // Check activity and handle streaks
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
      }

      console.log(`Status: ${activityStatus.wasActivePastDay ? '✅ Active' : '❌ Inactive'}`);
      console.log(`Streak: ${oldStreak} → ${newStreak}`);
      console.log(`-------------------`);

      userResults.push(result);
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Time: ${now.toLocaleString()}`);
    console.log(`Total users processed: ${users.length}`);
    console.log(`Streak loss emails sent: ${streakLossCount}`);
    console.log("=============\n");

    return NextResponse.json({ 
      message: "Cron job completed successfully",
      timestamp: now,
      paidUsersProcessed: users.length,
      streakLossEmails: streakLossCount,
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
