export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { featureId, cost } = body;

    // Validate parameters
    if (!featureId) {
      return NextResponse.json({ error: "Missing featureId parameter" }, { status: 400 });
    }
    
    if (!cost || typeof cost !== 'number' || cost <= 0) {
      return NextResponse.json({ error: "Invalid cost parameter" }, { status: 400 });
    }

    // Get current user info
    const userInfo = await prismadb.userInfo.findUnique({
      where: { userId }
    });

    if (!userInfo) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough coins
    if (userInfo.score < cost) {
      return NextResponse.json({ 
        error: "Insufficient coins", 
        coins: userInfo.score,
        required: cost 
      }, { status: 400 });
    }

    // Parse existing unlocks array
    const currentUnlocks = typeof userInfo.unlocks === 'string' 
      ? JSON.parse(userInfo.unlocks) 
      : (Array.isArray(userInfo.unlocks) ? userInfo.unlocks : []);

    // Check if feature is already unlocked
    if (currentUnlocks.includes(featureId)) {
      return NextResponse.json({
        message: "Feature already unlocked",
        unlocks: currentUnlocks,
        coins: userInfo.score
      });
    }

    // Add new unlock and decrement score
    const newUnlocks = [...currentUnlocks, featureId];
    
    // Update user info with new unlocks and reduced coins
    const updatedInfo = await prismadb.userInfo.update({
      where: { userId },
      data: {
        unlocks: newUnlocks,
        score: userInfo.score - cost
      }
    });

    return NextResponse.json({
      message: "Feature unlocked successfully",
      unlocks: newUnlocks,
      coins: updatedInfo.score
    });
  } catch (error) {
    console.error('[FEATURE_UNLOCK]', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 