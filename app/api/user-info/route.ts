// File: app/api/user-info/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { getUserInfo, updateNotificationPreference } from "@/lib/user-info";
import { incrementUserScore } from "@/lib/user-info";
import prismadb from "@/lib/prismadb";
import { DEFAULT_BIO } from "@/constants";

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userInfo = await getUserInfo();

    if (!userInfo) {
      return new NextResponse("User info not found", { status: 404 });
    }

    return NextResponse.json(userInfo);
  } catch (error) {
    console.log('[USER_INFO_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { firstName, bio } = body;

    console.log("user-info 42 Creating new user info for user:", userId);
    // Create or update UserInfo matching our schema exactly
    const userInfo = await prismadb.userInfo.upsert({
      where: { userId },
      create: {
        userId,
        bio: bio || DEFAULT_BIO,
        firstName: firstName || "",
        apiCount: 0,
        score: 30,
        clinicRooms: "",
        hasPaid: false,
        subscriptionType: "",
        diagnosticScores: {
          total: "",
          cp: "",
          cars: "",
          bb: "",
          ps: ""
        }
      },
      update: {
        firstName: firstName || "",
        bio: bio || DEFAULT_BIO,
      }
    });

    return NextResponse.json(userInfo);
  } catch (error) {
    console.log('[USER_INFO_INITIALIZE_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, notificationPreference, incrementScore, decrementScore, unlockGame, unlockType } = body;
    if (unlockGame) {
      const userInfo = await prismadb.userInfo.findUnique({
        where: { userId }
      });

      if (!userInfo) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Parse existing unlocks array
      const currentUnlocks = Array.isArray(userInfo.unlocks) ? userInfo.unlocks : [];
      
      // Check if already unlocked
      if (currentUnlocks.includes(unlockType)) {
        return NextResponse.json({ 
          message: "Already unlocked",
          unlocks: currentUnlocks,
          score: userInfo.score 
        });
      }

      // Add new unlock and decrement score
      const newUnlocks = [...currentUnlocks, unlockType];
      const updatedInfo = await prismadb.userInfo.update({
        where: { userId },
        data: {
          score: userInfo.score - decrementScore,
          unlocks: newUnlocks
        }
      });

      return NextResponse.json(updatedInfo);
    }

    // Handle score update with amount
    if (amount !== undefined) {
      if (typeof amount !== 'number' || isNaN(amount)) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      const updatedInfo = await incrementUserScore(amount);
      return NextResponse.json({ score: updatedInfo.score });
    }

    // Handle increment/decrement score
    if (incrementScore !== undefined || decrementScore !== undefined) {
      let scoreChange = 1; // Default increment
      
      if (decrementScore) {
        scoreChange = -1;
      }

      const updatedInfo = await incrementUserScore(scoreChange);
      return NextResponse.json({ score: updatedInfo.score });
    }

    // Handle notification preference update
    if (notificationPreference !== undefined) {
      const updatedInfo = await updateNotificationPreference(notificationPreference);
      
      if (!updatedInfo) {
        return NextResponse.json({ error: "Failed to update notification preference" }, { status: 400 });
      }

      return NextResponse.json({ notificationPreference: updatedInfo.notificationPreference });
    }

    return NextResponse.json({ error: "No valid update parameters provided" }, { status: 400 });
  } catch (error) {
    console.error('[USER_INFO_PUT]', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}