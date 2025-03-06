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

    let isEligible = true;
    let reason = "";

    // If no user info, they're new and eligible
    if (!userInfo) {
      return NextResponse.json({
        isEligible: true,
        reason: "New user"
      });
    }

    // Check if they've ever had a trial or subscription before (based on subscriptionType)
    if (userInfo.subscriptionType && userInfo.subscriptionType !== "None") {
      isEligible = false;
      reason = "User has had a subscription before";
    }

    // If we have a subscription record in our database, the user has subscribed before
    if (userSubscription?.stripeSubscriptionId) {
      isEligible = false;
      reason = "User has had a subscription before";

      try {
        // Get subscription from Stripe to check status
        const subscription = await stripe.subscriptions.retrieve(
          userSubscription.stripeSubscriptionId
        );

        // If subscription is active or trialing, they're definitely not eligible
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          isEligible = false;
          reason = "User already has an active subscription";
        }

        // Log the decision and the information used to make it
        console.log('Trial eligibility check:', {
          userId,
          isEligible,
          reason,
          subscriptionStatus: subscription.status,
          subscriptionType: userInfo.subscriptionType
        });
      } catch (error) {
        // If Stripe can't find the subscription, it might have been deleted
        // We'll rely on our database record
        console.error("Error checking Stripe subscription:", error);
      }
    }

    // Look for trial history in Stripe
    try {
      // List all subscriptions for this customer
      if (userSubscription?.stripeCustomerId) {
        const subscriptions = await stripe.subscriptions.list({
          customer: userSubscription.stripeCustomerId,
          limit: 100, // Increased limit to check history
          status: 'all' // Check all statuses including canceled
        });

        // Check if any subscription has trial_start, indicating they've had a trial
        const hadTrialBefore = subscriptions.data.some(sub => sub.trial_start !== null);
        
        if (hadTrialBefore) {
          isEligible = false;
          reason = "User has had a trial before";
        }

        console.log('Trial history check:', {
          userId,
          customerSubscriptions: subscriptions.data.length,
          hadTrialBefore
        });
      }
    } catch (error) {
      console.error("Error checking subscription history:", error);
    }

    return NextResponse.json({
      isEligible,
      reason
    });

  } catch (error) {
    console.error("[TRIAL_ELIGIBILITY_CHECK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 