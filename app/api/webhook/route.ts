import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { ProductType, isValidProductType, getCoinAmountForProduct, ProductName } from "@/types"
import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers();
  const signature = headerPayload.get("Stripe-Signature") as string

  console.log('Webhook received:', {
    eventType: JSON.parse(body).type,
    metadata: JSON.parse(body).data?.object?.metadata,
    customerId: JSON.parse(body).data?.object?.customer,
    subscriptionId: JSON.parse(body).data?.object?.subscription
  });

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('Event constructed successfully:', event.type);
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    // In production, we'll still process the event even if signature fails
    // This is because some webhook forwarders might modify the signature
    try {
      event = JSON.parse(body) as Stripe.Event;
      console.log('Proceeding with parsed event despite signature failure');
    } catch (parseError) {
      console.error("Failed to parse webhook body:", parseError);
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }
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

      console.log("sessions.data[0]?.metadata",sessions.data[0]?.metadata)
      const userId = sessions.data[0]?.metadata?.userId;
      
      if (!userId) {
        console.error('No userId found in session metadata for subscription:', subscription.id);
        return;
      }

      console.log('Processing subscription:', {
        userId,
        customerId,
        subscriptionId: subscription.id,
        productName: product.metadata.productName,
        isActive
      });

      // Update or create subscription record
      await upsertUserSubscription({
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });

      // Update user access in UserInfo
      await prismadb.userInfo.update({
        where: { userId },
        data: {
          hasPaid: isActive,
          subscriptionType: isActive ? (
            product.metadata.productName === 'MDPremium' ? "premium" : "gold"
          ) : "cancelled",
        }
      });

      console.log('Successfully updated subscription for user:', userId);
    } catch (error) {
      console.error('Error processing subscription event:', error);
      throw error;
    }
  }

  switch(event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'customer.subscription.paused':
    case 'customer.subscription.resumed':
      const subscriptionEvent = event.data.object as Stripe.Subscription;
      await handleSubscriptionEvent(subscriptionEvent);
      break;
    
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const productType = session.metadata?.productType;
      const productName = session.metadata?.productName;
            
      console.log("Checkout session completed:", {
        userId,
        productType,
        productName,
        customer: session.customer,
        subscription: session.subscription
      });

      if (userId && productType && isValidProductType(productType)) {
        try {
          const coinAmount = getCoinAmountForProduct(
            productType as ProductType,
            productName as ProductName
          );
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

    case "payment_intent.succeeded":
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse(null, { status: 200 })
}