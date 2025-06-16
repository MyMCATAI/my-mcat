export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { OnboardingInfo } from "@/types";

export async function PUT(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const onboardingData: Partial<OnboardingInfo> = body;

    // Get current onboarding info
    let currentUserInfo = await prismadb.userInfo.findUnique({
      where: { userId }
    });

    // If user doesn't exist, create a new record
    if (!currentUserInfo) {
      console.log('[ONBOARDING_INFO_UPDATE] Creating new user record for:', userId);
      currentUserInfo = await prismadb.userInfo.create({
        data: {
          userId,
          bio: "Hello! I'm studying for the MCAT and using MyMCAT.ai to achieve my goals!",
          firstName: onboardingData.firstName || "",
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
            firstName: onboardingData.firstName || null,
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
    }

    // Parse existing onboarding info
    const currentOnboardingInfo = currentUserInfo.onboardingInfo as Partial<OnboardingInfo> || {};

    // Merge new data with existing data
    const updatedOnboardingInfo = {
      ...currentOnboardingInfo,
      ...onboardingData
    };

    // Update the user info with merged onboarding data
    const updatedUserInfo = await prismadb.userInfo.update({
      where: { userId },
      data: {
        onboardingInfo: updatedOnboardingInfo,
        // If onboarding is complete, also update the firstName in the main userInfo
        ...(updatedOnboardingInfo.firstName && {
          firstName: updatedOnboardingInfo.firstName
        })
      }
    });

    return NextResponse.json(updatedUserInfo);
  } catch (error) {
    console.error('[ONBOARDING_INFO_UPDATE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userInfo = await prismadb.userInfo.findUnique({
      where: { userId }
    });

    if (!userInfo) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get onboarding info and merge with firstName if needed
    const onboardingInfo = userInfo.onboardingInfo as Partial<OnboardingInfo> || {};
    if (!onboardingInfo.firstName && userInfo.firstName) {
      onboardingInfo.firstName = userInfo.firstName;
    }

    return NextResponse.json(onboardingInfo);
  } catch (error) {
    console.error('[ONBOARDING_INFO_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 