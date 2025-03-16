// File: app/api/user-info/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { getUserInfo, updateNotificationPreference } from "@/lib/user-info";
import { incrementUserScore } from "@/lib/user-info";
import prismadb from "@/lib/prismadb";
import { DEFAULT_BIO } from "@/constants";
import { getUserEmail, getUserIdByEmail } from "@/lib/server-utils";

const REFERRAL_REWARD = 10;

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    let targetUserId = userId;
    if (email) {
      const emailUserId = await getUserIdByEmail(email);
      if (!emailUserId) {
        return new NextResponse("User not found", { status: 404 });
      }
      targetUserId = emailUserId;
    }

    const userInfo = await prismadb.userInfo.findUnique({
      where: {
        userId: targetUserId
      },
      include: {
        patientRecord: true
      }
    });

    if (!userInfo) {
      return new NextResponse("User info not found", { status: 404 });
    }

    const userEmail = await getUserEmail(targetUserId);

    return NextResponse.json({
      ...userInfo,
      email: userEmail,
    });
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

    // Check if user already exists and delete if found
    const existingUser = await prismadb.userInfo.findUnique({
      where: { userId }
    });

    if (existingUser) {
      // Delete the existing user record
      await prismadb.userInfo.delete({
        where: { userId }
      });
    }

    // Create the new user info
    const userInfo = await prismadb.userInfo.create({
      data: {
        userId,
        bio: bio || DEFAULT_BIO,
        firstName: firstName || "",
        apiCount: 0,
        score: 30,
        clinicRooms: JSON.stringify(["INTERN LEVEL"]),
        hasPaid: false,
        subscriptionType: "",
        diagnosticScores: {
          total: "",
          cp: "",
          cars: "",
          bb: "",
          ps: ""
        },
        onboardingInfo: {
          currentStep: 1,
          onboardingComplete: false,
          firstName: firstName || null,
          college: null,
          isNonTraditional: null,
          isCanadian: null,
          gpa: null,
          currentMcatScore: null,
          hasNotTakenMCAT: null,
          mcatAttemptNumber: null,
          targetMedSchool: null,
          targetScore: null,
          referralEmail: null
        }
      }
    });

    let referralRedeemed = false;

    // Handle referral updates in a separate try-catch
    try {
      const userEmail = await getUserEmail(userId);
      if (userEmail) {
        // Find the oldest referral for this email
        const oldestReferral = await prismadb.referral.findFirst({
          where: {
            friendEmail: userEmail
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        // Only process referrals if there is one and it's not from the user themselves
        if (oldestReferral && oldestReferral.userId !== userId) {
          await prismadb.$transaction([
            // Update referral with new user's ID
            prismadb.referral.update({
              where: { id: oldestReferral.id },
              data: {
                friendUserId: userId,
                joinedAt: new Date()
              }
            }),
            // Add coins to referrer
            prismadb.userInfo.update({
              where: { userId: oldestReferral.userId },
              data: {
                score: { increment: REFERRAL_REWARD }
              }
            }),
            // Add coins to new user
            prismadb.userInfo.update({
              where: { userId },
              data: {
                score: { increment: REFERRAL_REWARD }
              }
            }),
            // Update all other referrals for this email with the new userId (but no rewards)
            prismadb.referral.updateMany({
              where: {
                friendEmail: userEmail,
                id: { not: oldestReferral.id }, // Exclude the oldest referral we just updated
                friendUserId: null // Only update referrals that haven't been linked yet
              },
              data: {
                friendUserId: userId
              }
            })
          ]);
          referralRedeemed = true;
        }
      }
    } catch (error) {
      console.error("Error handling referral updates:", error);
    }

    return NextResponse.json({ ...userInfo, referralRedeemed });
  } catch (error) {
    console.error("[USER_INFO_POST]", error);
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
    const { bio, unlockGame, amount, incrementScore, decrementScore, notificationPreference } = body;

    // Handle bio update
    if (bio !== undefined) {
      const updatedInfo = await prismadb.userInfo.update({
        where: { userId },
        data: { bio },
        include: { patientRecord: true }
      });

      return NextResponse.json({
        ...updatedInfo,
        coins: updatedInfo.score,
        patientsCount: updatedInfo.patientRecord?.patientsTreated || 0
      });
    }

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
      if (currentUnlocks.includes('game')) {
        return NextResponse.json({
          message: "Already unlocked",
          unlocks: currentUnlocks,
          score: userInfo.score
        });
      }

      // Add new unlock and decrement score
      const newUnlocks = [...currentUnlocks, 'game'];
      const updatedInfo = await prismadb.userInfo.update({
        where: { userId },
        data: {
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