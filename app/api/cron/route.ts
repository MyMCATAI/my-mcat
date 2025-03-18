import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  getUserEmail,
  updateUserStreak,
  handleUserInactivity,
  sendStreakLossEmail
} from "@/lib/server-utils";
import {
  applyAbsencePenalties,
  calculateDailyAbsencePenalty,
  calculateWeeklyAbsencePenalty
} from "@/lib/coin/utils";
import { STREAK_REWARDS } from "@/lib/coin/constants";

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const prisma = new PrismaClient();

async function processCronJob(isDryRun: boolean = false) {
  const now = new Date();
  console.log(`${isDryRun ? '[DRY RUN] ' : ''}Starting inactivity check cron job at ${now.toLocaleString()}`);

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
      score: true
    },
  });

  console.log(`${isDryRun ? '[DRY RUN] ' : ''}Found ${users.length} users active in the last week`);

  let streakLossCount = 0;
  let penaltyCount = 0;
  const userResults = [];

  // Process each user
  for (const user of users) {
    const name = user.firstName || "Future Doctor";
    const email = await getUserEmail(user.userId);

    if (!email) {
      console.log(`${isDryRun ? '[DRY RUN] ' : ''}⚠️ Failed to fetch email for user ID: ${user.userId}`);
      continue;
    }

    console.log(`\n-------------------`);
    console.log(`${isDryRun ? '[DRY RUN] ' : ''}Processing user: ${name} (${email})`);

    // Check activity status without updating the database
    const activityStatus = await handleUserInactivity(user.userId);

    // Calculate streak changes without updating
    const oldStreak = user.streak;
    const newStreak = isDryRun ?
      (activityStatus.wasActivePastDay ? oldStreak + 1 : 0) :
      await updateUserStreak(user.userId, activityStatus.wasActivePastDay);

    // Process streak rewards
    let streakReward = 0;
    if (activityStatus.wasActivePastDay) {
      // Check if user hit a reward milestone
      if (newStreak === 7) {
        streakReward = STREAK_REWARDS.SEVEN_DAYS;
        console.log(`${isDryRun ? '[DRY RUN] ' : ''}🎉 7-day streak reward: +${streakReward} coins`);
      } else if (newStreak === 21) {
        streakReward = STREAK_REWARDS.TWENTY_ONE_DAYS;
        console.log(`${isDryRun ? '[DRY RUN] ' : ''}🎉 21-day streak reward: +${streakReward} coins`);
      }

      // Apply streak reward if not a dry run
      if (streakReward > 0 && !isDryRun) {
        await prisma.userInfo.update({
          where: { userId: user.userId },
          data: {
            score: {
              increment: streakReward
            }
          }
        });
      }
    }

    // Calculate penalties without applying them
    const penalty = isDryRun ?
      await calculatePotentialPenalties(user.userId) :
      await applyAbsencePenalties(user.userId);

    if (penalty < 0) {
      penaltyCount++;
      console.log(`${isDryRun ? '[DRY RUN] ' : ''}💰 Would apply coin penalty: ${penalty}`);
    }

    const result = {
      userId: user.userId,
      name,
      email,
      wasActive: activityStatus.wasActivePastDay,
      oldStreak,
      newStreak,
      streakReward,
      coinPenalty: penalty,
      emailsSent: [] as string[]
    };

    // Log potential email sends without actually sending
    if (user.notificationPreference === "all") {
      if (!activityStatus.wasActivePastDay && oldStreak > 0 && newStreak === 0) {
        if (!isDryRun) {
          const sent = await sendStreakLossEmail(email, name);
          if (sent) {
            streakLossCount++;
            result.emailsSent.push('streak-loss');
            console.log(`✉️ Sent streak loss email`);
          }
        } else {
          streakLossCount++;
          result.emailsSent.push('streak-loss');
          console.log(`${isDryRun ? '[DRY RUN] ' : ''}✉️ Would send streak loss email`);
        }
      }
    }

    console.log(`${isDryRun ? '[DRY RUN] ' : ''}Status: ${activityStatus.wasActivePastDay ? '✅ Active' : '❌ Inactive'}`);
    console.log(`${isDryRun ? '[DRY RUN] ' : ''}Streak: ${oldStreak} → ${newStreak}`);
    console.log(`-------------------`);

    userResults.push(result);
  }

  console.log(`\n=== ${isDryRun ? '[DRY RUN] ' : ''}SUMMARY ===`);
  console.log(`Time: ${now.toLocaleString()}`);
  console.log(`Total users processed: ${users.length}`);
  console.log(`Streak loss emails that would be sent: ${streakLossCount}`);
  console.log(`Users that would be penalized: ${penaltyCount}`);
  console.log("=============\n");

  return {
    message: isDryRun ? "Cron job test completed successfully" : "Cron job completed successfully",
    timestamp: now,
    paidUsersProcessed: users.length,
    streakLossEmails: streakLossCount,
    details: userResults
  };
}

// Helper function to calculate potential penalties without applying them
async function calculatePotentialPenalties(userId: string): Promise<number> {
  const [dailyPenalty, weeklyPenalty] = await Promise.all([
    calculateDailyAbsencePenalty(userId),
    calculateWeeklyAbsencePenalty(userId)
  ]);
  return dailyPenalty + weeklyPenalty;
}

export async function GET(request: NextRequest) {
  // Check if this is a test run
  const { searchParams } = new URL(request.url);
  const isTest = searchParams.get('test') === 'true';

  // For test runs, skip auth check
  if (!isTest) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log("Unauthorized request received");
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    const result = await processCronJob(isTest);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
