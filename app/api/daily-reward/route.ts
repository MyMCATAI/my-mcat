import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user subscription info
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId }
    });

    if (!userSubscription?.stripeSubscriptionId) {
      return NextResponse.json({ 
        success: false, 
        message: "No subscription found" 
      });
    }

    // Check if subscription is active with Stripe
    const subscription = await stripe.subscriptions.retrieve(
      userSubscription.stripeSubscriptionId
    );

    // Check if subscription is active and is MD Premium
    const isMDPremium = subscription.items.data.some(item => 
      item.price.id === "price_1RaVzBAtAHX4wxMZJPyg9hud"
    );

    if (subscription.status !== 'active' || !isMDPremium) {
      return NextResponse.json({ 
        success: false, 
        message: "No active MD Premium subscription" 
      });
    }

    // Check if user already received reward today
    const userInfo = await prismadb.userInfo.findUnique({
      where: { userId }
    });

    if (!userInfo) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if we already gave reward today by checking UserActivity for MD Premium rewards
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingReward = await prismadb.userActivity.findFirst({
      where: {
        userId,
        type: 'MD_PREMIUM_DAILY_REWARD',
        startTime: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingReward) {
      return NextResponse.json({ 
        success: false, 
        message: "Daily reward already claimed today" 
      });
    }

    // Award 100 coins and log the activity
    const [updatedUser, _] = await Promise.all([
      prismadb.userInfo.update({
        where: { userId },
        data: {
          score: {
            increment: 100
          }
        }
      }),
      prismadb.userActivity.create({
        data: {
          userId,
          type: 'MD_PREMIUM_DAILY_REWARD',
          location: 'daily_reward_api',
          metadata: {
            action: 'daily_reward',
            amount: 100,
            description: 'Daily MD Premium subscriber reward'
          }
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Daily reward claimed! +100 coins",
      newBalance: updatedUser.score
    });

  } catch (error) {
    console.error("Daily reward error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user subscription info
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId }
    });

    if (!userSubscription?.stripeSubscriptionId) {
      return NextResponse.json({ 
        eligible: false, 
        message: "No subscription found" 
      });
    }

    // Check if subscription is active with Stripe
    const subscription = await stripe.subscriptions.retrieve(
      userSubscription.stripeSubscriptionId
    );

    // Check if subscription is active and is MD Premium
    const isMDPremium = subscription.items.data.some(item => 
      item.price.id === "price_1RaVzBAtAHX4wxMZJPyg9hud"
    );

    if (subscription.status !== 'active' || !isMDPremium) {
      return NextResponse.json({ 
        eligible: false, 
        message: "No active MD Premium subscription" 
      });
    }

    // Check if user already received reward today
    const userInfo = await prismadb.userInfo.findUnique({
      where: { userId }
    });

    if (!userInfo) {
      return NextResponse.json({ 
        eligible: false, 
        message: "User not found" 
      });
    }

    // Check if reward already claimed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingReward = await prismadb.userActivity.findFirst({
      where: {
        userId,
        type: 'MD_PREMIUM_DAILY_REWARD',
        startTime: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const alreadyClaimed = !!existingReward;

    return NextResponse.json({ 
      eligible: true,
      alreadyClaimed,
      subscriptionActive: true,
      message: alreadyClaimed ? "Daily reward already claimed today" : "Daily reward available"
    });

  } catch (error) {
    console.error("Daily reward check error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 