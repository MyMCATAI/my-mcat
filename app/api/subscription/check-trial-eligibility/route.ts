import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get userInfo to check subscription type
    const userInfo = await prismadb.userInfo.findUnique({
      where: { userId }
    });

    // If no user info, they're new and eligible
    if (!userInfo) {
      return NextResponse.json({
        isEligible: true,
        reason: "New user"
      });
    }

    // User is only eligible if they've never had any subscription status
    const isEligible = !userInfo.subscriptionType || userInfo.subscriptionType === "";
    const reason = isEligible 
      ? "New user" 
      : "User has had a subscription or trial before";

    // Log the decision
    console.log('Trial eligibility check:', {
      userId,
      isEligible,
      reason,
      subscriptionType: userInfo.subscriptionType
    });

    return NextResponse.json({
      isEligible,
      reason
    });

  } catch (error) {
    console.error("[TRIAL_ELIGIBILITY_CHECK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 