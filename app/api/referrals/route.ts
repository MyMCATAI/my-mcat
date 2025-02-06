import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { getUserEmail, getUserIdByEmail, sendReferralEmail } from "@/lib/server-utils";
import { getUserInfo } from "@/lib/user-info";

interface ReferralRequestBody {
  friendEmail: string;  // This is required
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if we just want to check existence
    const { searchParams } = new URL(req.url);
    const checkExistence = searchParams.get("checkExistence") === "true";
    const requestUserId = searchParams.get("requestUserId");

    if (checkExistence) {
      const referral = await prismadb.referral.findFirst({
        where: { userId },
        select: { id: true },
      });

      return NextResponse.json({ exists: !!referral });
    }

    if (requestUserId) {
      const referrals = await prismadb.referral.findMany({
        where: { userId: requestUserId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json(referrals);
    }

    // Otherwise return all referrals
    const referrals = await prismadb.referral.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
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

    // Check existing referral
    const existingReferral = await prismadb.referral.findFirst({
      where: { userId, friendEmail: friendEmail.toLowerCase() },
    });

    if (existingReferral) {
      return new NextResponse("Friend invitation already sent", { status: 400 });
    }

    // Create referral
    const userInfo = await getUserInfo();
    const referrerName = userInfo?.firstName || "";
    const referrerEmail = await getUserEmail(userId);

    const friendUserId = await getUserIdByEmail(friendEmail);
    const joinedAt = new Date();
    let referral;

    if (friendUserId) {
      // Existing user
      referral = await prismadb.referral.create({
        data: {
          userId,
          referrerName: referrerName,
          referrerEmail: referrerEmail || "",
          friendEmail,
          friendUserId: friendUserId,
          joinedAt: joinedAt,
        },
      });
    } else {
      // New user
      referral = await prismadb.referral.create({
        data: {
          userId,
          referrerName: referrerName,
          referrerEmail: referrerEmail || "",
          friendEmail,
        },
      });

      // Send referral email if under referral limit
      const referralCount = await prismadb.referral.count({
        where: { userId },
      });

      if (referralCount < 3) {
        await sendReferralEmail(referrerName, friendEmail);
      }
    }

    return NextResponse.json(referral);
  } catch (error) {
    console.log("[REFERRALS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
