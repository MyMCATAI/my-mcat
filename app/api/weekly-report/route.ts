import { NextResponse } from 'next/server';
import { sendWeeklyReportEmail, getUserEmail } from '@/lib/server-utils';
import { PrismaClient } from '@prisma/client';
import { generateWeeklyReport } from '@/lib/weekly-report-utils';
import { subWeeks } from 'date-fns';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const oneWeekAgo = subWeeks(new Date(), 1);

    // Only get users who:
    // 1. Have paid
    // 2. Want all notifications
    // 3. Created their account at least a week ago
    const paidUsers = await prisma.userInfo.findMany({
      where: {
        // hasPaid: true, // uncomment to send to paid users only
        notificationPreference: {
          in: ["all", "important"]
        },
        createdAt: {
          lte: oneWeekAgo // Exclude users created less than a week ago
        },
        updatedAt: {
          gte: oneWeekAgo // Only include users active in the last week
        }
      }
    });

    console.log('\n=== Weekly Report Run ===');
    console.log(`Found ${paidUsers.length} eligible users for weekly report`);

    let successCount = 0;
    let failureCount = 0;

    for (const user of paidUsers) {
      try {
        const userEmail = await getUserEmail(user.userId);
        console.log(`\nProcessing user: ${user.firstName} (${user.userId})`);
        
        if (userEmail) {
          const reportData = await generateWeeklyReport(user.userId);
          console.log('Sending report to:', userEmail);
          
          const success = await sendWeeklyReportEmail(userEmail, {
            userName: user.firstName || "there",
            ...reportData,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            settingsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/preferences`
          });

          if (success) {
            successCount++;
            console.log('Email sent successfully');
          } else {
            failureCount++;
            console.log('Failed to send email');
          }
        }
      } catch (error) {
        console.error(`Failed to process weekly report for user ${user.userId}:`, error);
        failureCount++;
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Weekly reports sent. Success: ${successCount}, Failed: ${failureCount}`,
      totalEligibleUsers: paidUsers.length
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send weekly reports' },
      { status: 500 }
    );
  }
} 