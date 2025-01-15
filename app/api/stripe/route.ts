import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/home");

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId
      }
    });

    if (!userSubscription?.stripeCustomerId) {
      return new NextResponse("No active subscription", { status: 400 });
    }

    // Get the actual subscription from Stripe
    const stripeSubscription = userSubscription.stripeSubscriptionId ? 
      await stripe.subscriptions.retrieve(userSubscription.stripeSubscriptionId) : 
      null;

    const session = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      return_url: settingsUrl,
    });

    return new NextResponse(JSON.stringify({
      url: session.url,
      isActive: stripeSubscription?.status === 'active' || stripeSubscription?.status === 'trialing',
      isCanceled: stripeSubscription?.cancel_at_period_end,
      currentPeriodEnd: stripeSubscription?.current_period_end ? 
        new Date(stripeSubscription.current_period_end * 1000) : 
        null
    }));
    
  } catch (error) {
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}