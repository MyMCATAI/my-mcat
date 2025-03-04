export const dynamic = 'force-dynamic';

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

    // Get user's subscription from our database
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId }
    });

    // Get userInfo for subscription type
    const userInfo = await prismadb.userInfo.findUnique({
      where: { userId }
    });

    // If no subscription record exists
    if (!userSubscription || !userInfo) {
      return NextResponse.json({
        status: "none",
        subscription: null
      });
    }

    // If we have a subscription ID, get the current status from Stripe
    if (userSubscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          userSubscription.stripeSubscriptionId
        );

        return NextResponse.json({
          status: stripeSubscription.status,
          subscription: {
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            subscriptionType: userInfo.subscriptionType
          }
        });
      } catch (stripeError) {
        // If there's an error with Stripe, just return the userInfo subscription status
        console.error("Stripe subscription fetch error:", stripeError);
        return NextResponse.json({
          status: "active",
          subscription: {
            subscriptionType: userInfo.subscriptionType
          }
        });
      }
    }

    // If no Stripe subscription but user has subscription type
    return NextResponse.json({
      status: "active",
      subscription: {
        subscriptionType: userInfo.subscriptionType
      }
    });

  } catch (error) {
    console.error("[SUBSCRIPTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 