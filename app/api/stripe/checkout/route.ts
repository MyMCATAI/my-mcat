import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { absoluteUrl } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sendReferralEmail, sendWelcomeEmail } from "@/lib/server-utils";
import { ProductType, isValidProductType } from "@/types";

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
    let priceType = "default";
    let friendEmail: string | undefined;

    try {
      const body = await request.json();
      if (body) {
        priceType = body.priceType || "default";
        friendEmail = body.friendEmail || undefined;
      }
    } catch (error) {
      // If JSON parsing fails, we'll just use the default values
    }

    // If there's a valid friend email, create UserInfo with bonus score instead of checkout
    if (friendEmail?.trim()) {
      const user = await currentUser();
      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }

      const userEmail = user.emailAddresses[0]?.emailAddress;

      // Check if user exists
      const existingUser = await prismadb.userInfo.findUnique({
        where: { userId }
      });

      if (!existingUser) {
        return new NextResponse("User not found. Please complete onboarding first.", { status: 404 });
      }

      // Update existing user
      const userInfo = await prismadb.userInfo.update({
        where: { userId },
        data: {
          score: {
            increment: 5, // Add 5 to the existing score
          },
        },
      });

      // Handle referral logic
      if (user) {
        let referrerName: string | undefined;

        referrerName = userInfo?.firstName || user.firstName || "A friend";

        // Send both welcome and referral emails
        await Promise.all([
          sendWelcomeEmail(referrerName, userEmail),
          sendReferralEmail(referrerName, friendEmail),
        ]);

        try {
          await prismadb.referral.create({
            data: {
              userId,
              referrerName: user.fullName ?? "Unknown",
              referrerEmail: userEmail ?? "",
              friendEmail,
            },
          });

          const REFERRAL_REWARD = 10;
          // Update joinedAt and friendUserId for all referrals if friendUserId is null
          await prismadb.referral.updateMany({
            where: {
              friendEmail: userEmail,
              friendUserId: null
            },
            data: {
              joinedAt: new Date(),
              friendUserId: userId
            }
          });

          // Get the oldest referral record for this userEmail
          const referral = await prismadb.referral.findFirst({
            where: {
              friendEmail: userEmail
            },
            orderBy: {
              createdAt: 'asc'
            }
          })

          if (referral) {
            // Referral user get REFERRAL_REWARD coins
            const referralUserId = referral.userId;

            if (referralUserId !== userId) {
              await prismadb.userInfo.update({
                where: { userId: referralUserId },
                data: {
                  score: {
                    increment: REFERRAL_REWARD
                  }
                }
              })
            }
          }
        } catch (error) {
          console.error("Error creating referral:", error);
          // Continue execution even if referral creation fails
        }
      }

      // Return success response for referred users with redirect URL
      return NextResponse.json(
        {
          success: true,
          message: "User setup completed with referral bonus",
          url: `${process.env.NEXT_PUBLIC_APP_URL}/home`,
        },
        { headers: corsHeaders }
      );
    }

    // If no friend email, proceed with regular Stripe checkout
    let priceId: string;
    let productType: ProductType = ProductType.COINS_10; // Default product type
    let mode: 'payment' | 'subscription' = 'payment';

    // Validate and set product type
    if (isValidProductType(priceType)) {
      productType = priceType as ProductType;
      
      switch (productType) {
        case ProductType.COINS_10_DISCOUNT:
          priceId = process.env.STRIPE_PRICE_ID_HALF_OFF_DISCOUNT!;
          break;
        case ProductType.COINS_50:
          priceId = process.env.STRIPE_PRICE_50_ID!;
          break;
        case ProductType.MD_PREMIUM:
          priceId = process.env.STRIPE_PRICE_PREMIUM_ID!;
          mode = 'subscription';
          break;
        case ProductType.COINS_10:
        default:
          priceId = process.env.STRIPE_PRICE_ID!;
      }
    } else {
      priceId = process.env.STRIPE_PRICE_ID!; // Default to 10 coins if invalid type
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: absoluteUrl("/home?payment=success"),
      cancel_url: absoluteUrl("/home?payment=cancelled"),
      payment_method_types: ["card"],
      mode: mode,
      billing_address_collection: "auto",
      client_reference_id: userId,
      metadata: {
        userId: userId,
        productType: productType,
        productName: mode === 'subscription' ? (
          priceId === process.env.STRIPE_PRICE_PREMIUM_ID ? 'MDPremium' : 'MDGold'
        ) : 'one_time_purchase'
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    });

    console.log('Created checkout session:', {
      userId,
      mode,
      productType,
      metadata: stripeSession.metadata
    });

    return NextResponse.json(
      { url: stripeSession.url },
      { headers: corsHeaders }
    );
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}