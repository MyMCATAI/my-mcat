import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { getUserEmail, getUserIdByEmail, sendReferralEmail } from "@/lib/server-utils";
import { getUserInfo } from "@/lib/user-info";

interface ReferralRequestBody {
  friendEmail: string;
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const checkExistence = searchParams.get("checkExistence") === "true";
    const friendEmail = searchParams.get("email");

    if (checkExistence && friendEmail) {
      // First check if this email has any existing referrals
      const anyExistingReferral = await prismadb.referral.findFirst({
        where: {
          friendEmail: friendEmail.toLowerCase(),
        },
      });

      // Then check if this specific user has already sent a referral
      const userReferral = await prismadb.referral.findFirst({
        where: {
          userId,
          friendEmail: friendEmail.toLowerCase(),
        },
      });

      let isExistingUser = false;
      if (anyExistingReferral?.friendUserId) {
        // Check if user exists in userInfo table
        const userExists = await prismadb.userInfo.findUnique({
          where: { userId: anyExistingReferral.friendUserId }
        });
        isExistingUser = !!userExists;
      }

      return NextResponse.json({
        exists: !!userReferral,
        isExistingUser,
        isActiveFriend: isExistingUser && !!anyExistingReferral?.friendUserId,
        hasPendingReferral: !isExistingUser && !!anyExistingReferral
      });
    }

    // Get all referrals for a specific user
    const requestUserId = searchParams.get("requestUserId");
    if (!requestUserId) return NextResponse.json([]);

    const referrals = await prismadb.referral.findMany({
      where: { userId: requestUserId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.log("[REFERRALS_GET]", error);
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
    const { friendEmail } = body as ReferralRequestBody;

    // Check if a referral already exists from this user
    const existingReferral = await prismadb.referral.findFirst({
      where: {
        userId,
        friendEmail: friendEmail.toLowerCase()
      },
    });

    if (existingReferral) {
      return new NextResponse("Friend invitation already sent", { status: 400 });
    }

    // Get referrer's info
    const userInfo = await getUserInfo();
    const referrerName = userInfo?.firstName || "";
    const referrerEmail = await getUserEmail(userId);

    // Check if friend is an existing user
    const friendUserId = await getUserIdByEmail(friendEmail);

    // Create the referral record
    const referral = await prismadb.referral.create({
      data: {
        userId,
        referrerName,
        referrerEmail: referrerEmail || "",
        friendEmail: friendEmail.toLowerCase(),
        friendUserId: friendUserId || "",  // Will be empty string if not an existing user
        joinedAt: friendUserId ? new Date() : null  // Set joinedAt only for existing users
      },
    });

    // Send email only for new users
    if (!friendUserId) {
      await sendReferralEmail(referrerName, friendEmail);
    }

    return NextResponse.json(referral);
  } catch (error) {
    console.log("[REFERRALS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
