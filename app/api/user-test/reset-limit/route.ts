import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { startOfDay, endOfDay, subDays } from "date-fns";

const RESET_COST = 1; // Cost in coins to reset the test limit

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current coin balance
    const userInfo = await prisma.userInfo.findUnique({
      where: { userId },
      select: { score: true }
    });

    if (!userInfo) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userInfo.score < RESET_COST) {
      return NextResponse.json({ 
        error: "Insufficient coins", 
        currentCoins: userInfo.score 
      }, { status: 400 });
    }

    // Get today's date range
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Get yesterday's date
    const yesterday = subDays(today, 1);

    // Update the finishedAt timestamps of today's completed tests to yesterday
    // This effectively "resets" today's test count without losing test data
    await prisma.userTest.updateMany({
      where: {
        userId,
        finishedAt: {
          gte: todayStart,
          lte: todayEnd,
        }
      },
      data: {
        finishedAt: yesterday
      }
    });

    // Deduct coins
    await prisma.userInfo.update({
      where: { userId },
      data: {
        score: userInfo.score - RESET_COST
      }
    });

    return NextResponse.json({ 
      success: true, 
      remainingCoins: userInfo.score - RESET_COST 
    });

  } catch (error) {
    console.error('[RESET_LIMIT]', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 