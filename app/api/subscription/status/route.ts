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

    // Get userInfo for subscription type and creation date
    const userInfo = await prismadb.userInfo.findUnique({
      where: { userId }
    });

    // If no subscription record exists
    if (!userInfo) {
      return NextResponse.json({
        status: "none",
        subscription: null
      });
    }

    // Check if user is within 14-day trial period based on account creation
    const isNewUser = userInfo.createdAt ? isWithin14Days(userInfo.createdAt) : false;
    
    // Calculate trial end date for new users
    let newUserTrialEnd = null;
    if (isNewUser && userInfo.createdAt) {
      const trialEndDate = new Date(userInfo.createdAt);
      trialEndDate.setDate(trialEndDate.getDate() + 14);
      newUserTrialEnd = trialEndDate;
    }

    // Check if it's a trial based on subscriptionType
    const isUserInTrialFromDB = userInfo.subscriptionType?.includes('_Trial') || false;

    // If we have a subscription ID, get the current status from Stripe
    if (userSubscription?.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          userSubscription.stripeSubscriptionId
        );

        // Include trial information if in trial period
        const isTrialPeriod = stripeSubscription.status === 'trialing';
        const trialEnd = isTrialPeriod && stripeSubscription.trial_end 
          ? new Date(stripeSubscription.trial_end * 1000) 
          : newUserTrialEnd;

        console.log('Retrieved subscription status for user:', {
          userId,
          subscriptionId: stripeSubscription.id,
          status: stripeSubscription.status,
          isTrialPeriod,
          isUserInTrialFromDB,
          isNewUser,
          userCreatedAt: userInfo.createdAt?.toISOString(),
          userSubscriptionType: userInfo.subscriptionType,
          trialEnd: trialEnd?.toISOString(),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString()
        });

        // Determine final status
        const finalStatus = isNewUser && !isTrialPeriod && !isUserInTrialFromDB
          ? 'trialing'  // Force trialing status for new users
          : stripeSubscription.status;

        return NextResponse.json({
          status: finalStatus,
          subscription: {
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            subscriptionType: userInfo.subscriptionType,
            trialEnd: trialEnd,
            isNewUserTrial: isNewUser
          }
        });
      } catch (stripeError) {
        // If there's an error with Stripe, just return the userInfo subscription type
        console.error("Stripe subscription fetch error:", stripeError);
        
        // Determine status from subscriptionType or new user status
        const status = isNewUser ? 'trialing' :
                       isUserInTrialFromDB ? 'trialing' : 
                       userInfo.subscriptionType !== 'None' ? 'active' : 'none';
                       
        return NextResponse.json({
          status: status,
          subscription: {
            subscriptionType: userInfo.subscriptionType,
            trialEnd: newUserTrialEnd,
            isNewUserTrial: isNewUser
          }
        });
      }
    }

    // If no Stripe subscription but user has subscription type or is a new user
    // Determine status from subscriptionType or new user status
    const status = isNewUser ? 'trialing' :
                   isUserInTrialFromDB ? 'trialing' : 
                   userInfo.subscriptionType !== 'None' ? 'active' : 'none';
                  
    return NextResponse.json({
      status: status,
      subscription: {
        subscriptionType: userInfo.subscriptionType,
        trialEnd: newUserTrialEnd,
        isNewUserTrial: isNewUser
      }
    });

  } catch (error) {
    console.error("[SUBSCRIPTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Helper function to check if a date is within the last 14 days
function isWithin14Days(date: Date): boolean {
  const now = new Date();
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(now.getDate() - 14);
  
  return date >= fourteenDaysAgo;
} 