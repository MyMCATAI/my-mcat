import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { absoluteUrl } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sendReferralEmail, sendWelcomeEmail } from "@/lib/server-utils";

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

    // Make body parsing optional with default values
    let priceType = 'default';
    let friendEmail: string | undefined;
    
    try {
      const body = await request.json();
      if (body) {
        priceType = body.priceType || 'default';
        friendEmail = body.friendEmail || undefined;
      }
    } catch (error) {
      // If JSON parsing fails, we'll just use the default values
    }

    // Only process referral if friendEmail is provided and is a non-empty string
    if (friendEmail?.trim()) {
      const user = await currentUser();
      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }

      // Get user's email
      const userEmail = user.emailAddresses[0]?.emailAddress;
      
      if (user) {
        // First try to get firstName from Clerk user, then fallback to UserInfo
        let referrerName = user.firstName;
        if (!referrerName) {
          const userInfo = await prismadb.userInfo.findUnique({
            where: { userId }
          });
          referrerName = userInfo?.firstName || 'A friend';
        }
        
        // Send both welcome and referral emails
        await Promise.all([
          sendWelcomeEmail(referrerName, userEmail),
          sendReferralEmail(referrerName, friendEmail)
        ]);
      }

      try {
        await prismadb.referral.create({
          data: {
            userId,
            referrerName: user.fullName ?? "Unknown",
            referrerEmail: userEmail ?? "",
            friendEmail,
          }
        });
      } catch (error) {
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
    return new NextResponse("Internal Error", { status: 500 });
  }
}