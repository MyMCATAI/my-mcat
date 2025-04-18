import type Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { ProductType, isValidProductType, getCoinAmountForProduct, type ProductName } from "@/types"
import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { applyRateLimit } from "@/lib/rate-limiter"

// Maintain a cache of processed webhook IDs to prevent replay attacks
const processedEvents = new Set<string>();
// Set maximum age for webhook events (10 minutes in milliseconds)
const MAX_EVENT_AGE = 10 * 60 * 1000;

export async function POST(req: Request) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, 'auth');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = await req.text()
  const headerPayload = await headers();
  const signature = headerPayload.get("Stripe-Signature") as string

  if (!signature) {
    console.error("No Stripe signature found in headers");
    return new NextResponse("Webhook Error: No signature provided", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature if secret is available
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing Stripe webhook secret");
    }
    
    // Strictly verify the webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    
    // Validate event timestamp to prevent replay attacks
    const eventTimestamp = event.created * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    if (currentTime - eventTimestamp > MAX_EVENT_AGE) {
      console.error("Webhook event too old:", { eventAge: currentTime - eventTimestamp });
      return new NextResponse("Webhook Error: Event too old", { status: 400 });
    }
    
    // Check if we've already processed this event (prevent duplicate processing)
    if (processedEvents.has(event.id)) {
      console.log("Webhook event already processed:", event.id);
      return new NextResponse("Event already processed", { status: 200 });
    }
    
    // Add this event to our processed set (limit set size to prevent memory issues)
    processedEvents.add(event.id);
    if (processedEvents.size > 1000) {
      // Remove oldest entries when we hit 1000 events
      const iterator = processedEvents.values();
      for (let i = 0; i < 200; i++) {
        processedEvents.delete(iterator.next().value);
      }
    }
    
    // Log basic event info
    console.log('Webhook received and verified:', {
      eventType: event.type,
      eventId: event.id
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Webhook signature verification failed:", errorMessage);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  async function upsertUserSubscription(data: any) {
    try {
      // Try to find an existing record
      const existingSubscription = await prismadb.userSubscription.findFirst({
        where: {
          OR: [
            { stripeCustomerId: data.stripeCustomerId },
            { stripeSubscriptionId: data.stripeSubscriptionId },
            { userId: data.userId },
          ].filter(Boolean),
        },
      });

      if (existingSubscription) {
        // Update the existing record
        return await prismadb.userSubscription.update({
          where: { id: existingSubscription.id },
          data: data,
        });
      } else {
        // Create a new record
        return await prismadb.userSubscription.create({
          data: data,
        });
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        console.error('Unique constraint failed. Retrying with update operation.');
        // If create fails due to unique constraint, try updating all possible existing records
        await prismadb.userSubscription.updateMany({
          where: {
            OR: [
              { stripeCustomerId: data.stripeCustomerId },
              { stripeSubscriptionId: data.stripeSubscriptionId },
              { userId: data.userId },
            ].filter(Boolean),
          },
          data: data,
        });
      } else {
        throw error;
      }
    }
  }

  async function handleSubscriptionEvent(subscriptionEvent: Stripe.Subscription) {
    const customerId = subscriptionEvent.customer as string;
    const subscription = subscriptionEvent;
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    const isTrial = subscription.status === 'trialing';
    
    try {
      // Get product details to determine subscription type
      const product = await stripe.products.retrieve(
        subscription.items.data[0].price.product as string
      );
      
      // Get the latest checkout session for this subscription to get the userId
      const sessions = await stripe.checkout.sessions.list({
        limit: 1,
        subscription: subscription.id,
      });

      console.log("sessions.data[0]?.metadata", sessions.data[0]?.metadata)
      const userId = sessions.data[0]?.metadata?.userId;
      
      if (!userId) {
        console.error('No userId found in session metadata for subscription:', subscription.id);
        return;
      }

      // Determine the subscription type
      let subscriptionType = 'None';
      if (isActive) {
        if (product.name?.toLowerCase().includes('gold')) {
          // Add _Trial suffix if the subscription is in trial period
          subscriptionType = isTrial ? 'Gold_Trial' : 'Gold';
        } else if (product.name?.toLowerCase().includes('premium')) {
          subscriptionType = isTrial ? 'Premium_Trial' : 'Premium';
        }
      }

      console.log('Processing subscription event:', {
        userId,
        customerId,
        subscriptionId: subscription.id,
        productName: product.name,
        isTrial,
        subscriptionType,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
      });

      // Update the user info
      await prismadb.userInfo.update({
        where: { userId },
        data: {
          subscriptionType: subscriptionType,
          hasPaid: isActive
        }
      });

      // Also update or create subscription record
      if (subscription.status !== 'canceled') {
        await upsertUserSubscription({
          userId: userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });
      }
    } catch (error) {
      console.error('Error processing subscription event:', error);
    }
  }

  switch(event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'customer.subscription.paused':
    case 'customer.subscription.resumed': {
      const subscriptionEvent = event.data.object as Stripe.Subscription;
      await handleSubscriptionEvent(subscriptionEvent);
      break;
    }
    
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const productType = session.metadata?.productType;
      const productName = session.metadata?.productName;
      const isTrial = session.metadata?.isTrial === 'true';
            
      console.log("Checkout session completed:", {
        userId,
        productType,
        productName,
        customer: session.customer,
        subscription: session.subscription,
        isTrial
      });

      if (userId && productType && isValidProductType(productType)) {
        try {
          const coinAmount = getCoinAmountForProduct(
            productType as ProductType,
            productName as ProductName
          );

          console.log("coinAmount", coinAmount)
          console.log("productType", productType)
          console.log("productName", productName)
          const isPremium = productType === ProductType.MD_PREMIUM;

          // First check if user exists
          const existingUser = await prismadb.userInfo.findUnique({
            where: { userId }
          });

          if (!existingUser) {
            console.error("User info not found for user:", userId);
            return new NextResponse("User not found. Please complete onboarding first.", { status: 404 });
          }

          // Update existing user
          await prismadb.userInfo.update({
            where: { userId },
            data: { 
              score: {
                increment: coinAmount
              },
              hasPaid: true,
              subscriptionType: isPremium ? "premium" : "coins",
            }
          });

          // If this is a subscription (premium or gold), create/update UserSubscription
          if (session.mode === 'subscription' && session.customer && session.subscription) {
            // Fetch the subscription to get accurate details
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            
            await upsertUserSubscription({
              userId: userId, // Explicitly set userId from session metadata
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            });
            
            console.log("Created/Updated subscription for user:", {
              userId,
              customerId: session.customer,
              subscriptionId: session.subscription
            });
          }
        } catch (error) {
          console.error("Error updating user info:", error);
          throw error; // Re-throw to ensure we see the error in logs
        }
      }
      break;
    }

    case "payment_intent.succeeded": {
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}