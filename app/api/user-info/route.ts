// File: app/api/user-info/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { getUserInfo, updateNotificationPreference } from "@/lib/user-info";
import { incrementUserScore } from "@/lib/user-info";
import prismadb from "@/lib/prismadb";
import { DEFAULT_BIO } from "@/constants";
import { getUserEmail } from "@/lib/server-utils";

const REFERRAL_REWARD = 10;

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const userIds = url.searchParams.get("userIds");
    if (userIds) {
      const userIdArray = userIds.split(",");
      const userInfo = await prismadb.userInfo.findMany({
        where: {
          userId: {
            in: userIdArray,
          },
        },
      });

      return NextResponse.json(userInfo);
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

    // Create the new user info first - this is the primary operation
    const userInfo = await prismadb.userInfo.create({
      data: {
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
      }
    });

    // Handle referral updates in a separate try-catch
    try {
      // Get the user's email - if this fails, we'll just skip referral handling
      console.log("updating referrals")
      const userEmail = await getUserEmail(userId);
      console.log("userEmail",userEmail)
      if (userEmail) {
        // Update all referrals where this user was referred
        await prismadb.referral.updateMany({
          where: {
            friendEmail: userEmail,
            friendUserId: null || ""
          },
          data: {
            friendUserId: userId,
            joinedAt: new Date()
          }
        });

        // Find the oldest referral for this email to reward the referrer
        const oldestReferral = await prismadb.referral.findFirst({
          where: {
            friendEmail: userEmail
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        // If there was a referral, reward the referrer with coins
        if (oldestReferral && oldestReferral.userId !== userId) {
          await prismadb.userInfo.update({
            where: { userId: oldestReferral.userId },
            data: {
              score: {
                increment: REFERRAL_REWARD
              }
            }
          });
        }
      }
    } catch (error) {
      console.error("Error handling referral updates:", error);
      // We don't want to fail the user creation if referral handling fails
      // Just log the error and continue
    }

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