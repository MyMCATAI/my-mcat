import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { absoluteUrl } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { priceType = 'default', friendEmail } = body;


    // TODO later, set up an email automation to send outreach message to referal

    // If this is a referral purchase, store the referral data
    if (friendEmail) {
      const user = await currentUser();
      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }

      try {
        // Create referral record
        await prismadb.referral.create({
          data: {
            userId,
            referrerName: user.fullName ?? "Unknown",
            referrerEmail: user.emailAddresses[0]?.emailAddress ?? "",
            friendEmail,
          }
        });
      } catch (error) {
        console.log("[REFERRAL_ERROR]", { error, friendEmail, userId });
        // Continue execution even if referral creation fails
      }
    }

    // Determine which price ID to use
    let priceId;
    switch (priceType) {
      case 'discount':
        priceId = process.env.STRIPE_PRICE_ID_HALF_OFF_DISCOUNT!;
        break;
      default:
        priceId = process.env.STRIPE_PRICE_ID!;
        break;
    }

    // Create or ensure UserInfo exists
    const userInfo = await prismadb.userInfo.upsert({
      where: { userId },
      create: { 
        userId,
        bio: "Future doctor preparing to ace the MCAT! 🎯 Committed to learning and growing every day."
      },
      update: {}
    });

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: absoluteUrl("/home?payment=success"),
      cancel_url: absoluteUrl("/home?payment=cancelled"),
      payment_method_types: ["card"],
      mode: "payment",
      billing_address_collection: "auto",
      client_reference_id: userId,
      metadata: {
        userId: userId,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
    });

    return NextResponse.json({ url: stripeSession.url }, { headers: corsHeaders });
  } catch (error) {
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}