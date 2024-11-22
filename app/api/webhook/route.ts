import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers(); // Await the headers
  const signature = headerPayload.get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
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
    
    await upsertUserSubscription({
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionEvent.id,
      stripePriceId: subscriptionEvent.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscriptionEvent.current_period_end * 1000),
    });
  }

  switch(event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscriptionEvent = event.data.object as Stripe.Subscription;
      await handleSubscriptionEvent(subscriptionEvent);
      break;
    
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
            
      if (userId) {
        try {
          // Update the user's score
          await prismadb.userInfo.update({
            where: { userId },
            data: { 
              score: {
                increment: 10
              }
            },
          });
        } catch (error) {
          console.error("Error updating user score:", error);
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