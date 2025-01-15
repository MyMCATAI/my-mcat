import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

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

    // If no subscription record exists
    if (!userSubscription) {
      return NextResponse.json({
        status: "none",
        subscription: null
      });
    }

    // If we have a subscription ID, get the current status from Stripe
    if (userSubscription.stripeSubscriptionId) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        userSubscription.stripeSubscriptionId
      );

      // Get the product details to determine if it's Premium or Gold
      const priceId = stripeSubscription.items.data[0].price.id;
      const product = await stripe.products.retrieve(
        stripeSubscription.items.data[0].price.product as string
      );

      const subscriptionData = {
        status: stripeSubscription.status,
        productName: product.metadata.productName, // "MDPremium" or "MDGold"
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      };

      return NextResponse.json({
        status: subscriptionData.status,
        subscription: subscriptionData
      });
    }

    return NextResponse.json({
      status: "none",
      subscription: null
    });

  } catch (error) {
    console.error("[SUBSCRIPTION_STATUS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 