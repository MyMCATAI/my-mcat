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
    // Get today's date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get end of today
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Find all incomplete activities scheduled for today
    const incompleteActivities = await prisma.calendarActivity.findMany({
      where: {
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

    console.log(`Found ${incompleteActivities.length} incomplete activities for today`);

    // Group activities by user
    const userActivities: { [key: string]: typeof incompleteActivities } = {};
    incompleteActivities.forEach(activity => {
      if (!userActivities[activity.userId]) {
        userActivities[activity.userId] = [];
      }
      userActivities[activity.userId].push(activity);
    });

    // Process each user's activities
    for (const [userId, activities] of Object.entries(userActivities)) {
      const email = await getUserEmail(userId);
      if (!email) {
        console.error(`Failed to fetch email for user ID: ${userId}`);
        continue;
      }

      // Get user info for personalization
      const userInfo = await prisma.userInfo.findUnique({
        where: { userId },
        select: { firstName: true }
      });

      const name = userInfo?.firstName || "Future Doctor";
      
      // Format pending goals as a simple list of activity names
      const pendingGoals = activities
        .map(activity => activity.activityTitle)
        .join('\n');
      
      // Send reminder email using the server-utils function
      const emailSent = await sendReminderEmail(email, name, pendingGoals);
      
      if (emailSent) {
        console.log(`Successfully sent daily reminder email to user ${userId}`);
      } else {
        console.error(`Failed to send daily reminder email to user ${userId}`);
      }
    }

    // Log success and return response
    const now = new Date();
    console.log("Daily reminder job completed at:", now);
    return NextResponse.json({ 
      message: "Daily reminder job completed successfully",
      timestamp: now,
      activitiesFound: incompleteActivities.length,
      usersProcessed: Object.keys(userActivities).length
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