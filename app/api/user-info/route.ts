// File: app/api/user-info/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { getUserInfo, updateNotificationPreference, NotificationPreference } from "@/lib/user-info";
import { incrementUserScore } from "@/lib/user-info";
import prismadb from "@/lib/prismadb";
import { DEFAULT_BIO } from "@/constants";
import { getUserEmail, getUserIdByEmail } from "@/lib/server-utils";
import { z } from 'zod';
import { handleApiError } from '@/lib/error-handler';

const ROUTE_NAME = 'USER_INFO';
const REFERRAL_REWARD = 10;

// Input validation schemas
const emailSchema = z.object({
  email: z.string().email().optional(),
});

const userInfoPostSchema = z.object({
  firstName: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(500).optional(),
});

const userInfoPutSchema = z.object({
  bio: z.string().trim().max(500).optional(),
  amount: z.number().int().optional(),
  incrementScore: z.boolean().optional(),
  decrementScore: z.boolean().optional(),
  notificationPreference: z.enum(['all', 'important', 'none']).optional(),
  onboardingInfo: z.record(z.any()).optional(),
});

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    // Validate email if present
    if (email) {
      const result = emailSchema.safeParse({ email });
      if (!result.success) {
        const validationError = new Error('Invalid email format');
        validationError.name = 'ZodError';
        return handleApiError(validationError, ROUTE_NAME, {
          statusCode: 400,
          additionalInfo: { validationErrors: result.error.format() }
        });
      }
    }

    let targetUserId = userId;
    if (email) {
      const emailUserId = await getUserIdByEmail(email);
      if (!emailUserId) {
        const notFoundError = new Error('User not found');
        return handleApiError(notFoundError, ROUTE_NAME, { statusCode: 404 });
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
      const notFoundError = new Error('User info not found');
      return handleApiError(notFoundError, ROUTE_NAME, { statusCode: 404 });
    }

    const userEmail = await getUserEmail(targetUserId);

    // Filter PII from the response
    const safeUserInfo = {
      // userId: userInfo.userId,
      firstName: userInfo.firstName,
      bio: userInfo.bio,
      score: userInfo.score,
      clinicRooms: userInfo.clinicRooms,
      hasPaid: userInfo.hasPaid,
      subscriptionType: userInfo.subscriptionType,
      diagnosticScores: userInfo.diagnosticScores,
      onboardingInfo: userInfo.onboardingInfo,
      unlocks: userInfo.unlocks,
      patientRecord: userInfo.patientRecord ? {
        patientsTreated: userInfo.patientRecord.patientsTreated
      } : null,
      email: userEmail,
    };

    return NextResponse.json(safeUserInfo);
  } catch (error) {
    return handleApiError(error, ROUTE_NAME, {
      additionalInfo: { method: 'GET' }
    });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Validate request body
    const result = userInfoPostSchema.safeParse(body);
    if (!result.success) {
      const validationError = new Error('Invalid input data');
      validationError.name = 'ZodError';
      return handleApiError(validationError, ROUTE_NAME, {
        statusCode: 400,
        additionalInfo: { validationErrors: result.error.format() }
      });
    }
    
    const { firstName, bio } = result.data;

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

    // Create the new user info with sanitized inputs
    const userInfo = await prismadb.userInfo.create({
      data: {
        userId,
        bio: bio || DEFAULT_BIO,
        firstName: firstName || "",
        apiCount: 0,
        score: 30,
        clinicRooms: JSON.stringify([]),
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
          referralEmail: null,
          hasSeenIntroVideo: false
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
      // Log but don't expose this error to client
      console.error("Error handling referral updates:", error);
    }

    return NextResponse.json({ ...userInfo, referralRedeemed });
  } catch (error) {
    return handleApiError(error, ROUTE_NAME, {
      additionalInfo: { method: 'POST' }
    });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request body
    const result = userInfoPutSchema.safeParse(body);
    if (!result.success) {
      const validationError = new Error('Invalid input data');
      validationError.name = 'ZodError';
      return handleApiError(validationError, ROUTE_NAME, {
        statusCode: 400,
        additionalInfo: { validationErrors: result.error.format() }
      });
    }
    
    const { bio, amount, incrementScore, decrementScore, notificationPreference, onboardingInfo } = result.data;

    // Handle onboardingInfo update
    if (onboardingInfo) {
      // Additional validation for onboardingInfo fields could be added here
      const updatedInfo = await prismadb.userInfo.update({
        where: { userId },
        data: { 
          onboardingInfo: {
            ...onboardingInfo
          }
        },
        include: { patientRecord: true }
      });

      return NextResponse.json({
        ...updatedInfo,
        coins: updatedInfo.score,
        patientsCount: updatedInfo.patientRecord?.patientsTreated || 0
      });
    }

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

    // Handle score update with amount
    if (amount !== undefined) {
      if (typeof amount !== 'number' || Number.isNaN(amount)) {
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
    return handleApiError(error, ROUTE_NAME, {
      additionalInfo: { method: 'PUT' }
    });
  }
}