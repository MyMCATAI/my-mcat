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

    // Check if it's a trial based on subscriptionType
    const isUserInTrialFromDB = userInfo.subscriptionType?.includes('_Trial') || false;

    // If we have a subscription ID, get the current status from Stripe
    if (userSubscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          userSubscription.stripeSubscriptionId
        );

        // Include trial information if in trial period
        const isTrialPeriod = stripeSubscription.status === 'trialing';
        const trialEnd = isTrialPeriod && stripeSubscription.trial_end 
          ? new Date(stripeSubscription.trial_end * 1000) 
          : undefined;

        console.log('Retrieved subscription status for user:', {
          userId,
          subscriptionId: stripeSubscription.id,
          status: stripeSubscription.status,
          isTrialPeriod,
          isUserInTrialFromDB,
          userSubscriptionType: userInfo.subscriptionType,
          trialEnd: trialEnd?.toISOString(),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString()
        });

        return NextResponse.json({
          status: stripeSubscription.status,
          subscription: {
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            subscriptionType: userInfo.subscriptionType,
            trialEnd: trialEnd
          }
        });
      } catch (stripeError) {
        // If there's an error with Stripe, just return the userInfo subscription type
        console.error("Stripe subscription fetch error:", stripeError);
        // Determine status from subscriptionType
        const status = isUserInTrialFromDB ? 'trialing' : 
                       userInfo.subscriptionType !== 'None' ? 'active' : 'none';
                       
        return NextResponse.json({
          status: status,
          subscription: {
            subscriptionType: userInfo.subscriptionType
          }
        });
      }
    }

    // If no Stripe subscription but user has subscription type
    // Determine status from subscriptionType
    const status = isUserInTrialFromDB ? 'trialing' : 
                   userInfo.subscriptionType !== 'None' ? 'active' : 'none';
                  
    return NextResponse.json({
      status: status,
      subscription: {
        subscriptionType: userInfo.subscriptionType
      }
    });

  } catch (error) {
    console.error("[SUBSCRIPTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 