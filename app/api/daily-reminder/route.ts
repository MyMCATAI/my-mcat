import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserEmail, sendReminderEmail } from "@/lib/server-utils";

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

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
        firstName: true,
        notificationPreference: true,
      },
    });

    console.log(`Found ${users.length} paid users active in the last week`);

    // Get today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    let emailsSent = 0;

    // Process each paid user
    for (const user of users) {
      // Skip users who don't want notifications
      if (user.notificationPreference !== "all") {
        continue;
      }

      // Check for incomplete activities for this user
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
        if (!email) {
          console.error(`Failed to fetch email for user ID: ${user.userId}`);
          continue;
        }

        const name = user.firstName || "Future Doctor";
        
        // Format pending goals
        const pendingGoals = incompleteActivities
          .map(activity => activity.activityTitle)
          .join('\n');
        
        // Send reminder email
        const emailSent = await sendReminderEmail(email, name, pendingGoals);
        
        if (emailSent) {
          emailsSent++;
          console.log(`Successfully sent daily reminder email to user ${user.userId}`);
        } else {
          console.error(`Failed to send daily reminder email to user ${user.userId}`);
        }
      }
    }

    // Log success and return response
    const now = new Date();
    return NextResponse.json({ 
      message: "Daily reminder job completed successfully",
      timestamp: now,
      paidUsersProcessed: users.length,
      emailsSent
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