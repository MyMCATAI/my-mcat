import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserEmail, sendReminderEmail } from "@/lib/server-utils";

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const now = new Date();
  console.log(`Starting daily reminder job at ${now.toLocaleString()}`);
  
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
        firstName: true,
        notificationPreference: true,
      },
    });

    // Get today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    let wouldHaveSentEmails = 0;
    const emailDetails = [];

    // Process each paid user
    for (const user of users) {
      if (user.notificationPreference !== "all") continue;

      const incompleteActivities = await prisma.calendarActivity.findMany({
        where: {
          userId: user.userId,
          scheduledDate: {
            gte: today,
            lte: endOfToday,
          },
          status: {
            not: "Complete"
          }
        },
        include: {
          studyPlan: true,
          category: true
        }
      });

      // Only proceed if user has incomplete activities
      if (incompleteActivities.length > 0) {
        const email = await getUserEmail(user.userId);
        if (!email) continue;

        wouldHaveSentEmails++;
        
        const unfinishedTasks = incompleteActivities.map(activity => ({
          title: activity.activityTitle,
          type: activity.activityType,
          hours: activity.hours,
          status: activity.status
        }));

        console.log('\n-------------------');
        console.log(`User: ${user.firstName || "Future Doctor"} (${email})`);
        console.log('Unfinished tasks:');
        console.table(unfinishedTasks);
        console.log('-------------------');

        emailDetails.push({
          userId: user.userId,
          email,
          name: user.firstName || "Future Doctor",
          incompleteActivitiesCount: incompleteActivities.length,
          tasks: unfinishedTasks
        });
      }
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Time: ${now.toLocaleString()}`);
    console.log(`Total users processed: ${users.length}`);
    console.log(`Users with incomplete tasks: ${wouldHaveSentEmails}`);
    console.log("=============\n");

    return NextResponse.json({ 
      message: "Daily reminder dry run completed successfully",
      timestamp: now,
      paidUsersProcessed: users.length,
      wouldHaveSentEmails,
      emailDetails
    });

  } catch (error) {
    console.error("Daily reminder job failed:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 