import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if we just want to check existence
    const { searchParams } = new URL(req.url);
    const checkExistence = searchParams.get('checkExistence') === 'true';

    if (checkExistence) {
      const referral = await prismadb.referral.findFirst({
        where: { userId },
        select: { id: true }
      });

      return NextResponse.json({ exists: !!referral });
    }

    // Otherwise return all referrals
    const referrals = await prismadb.referral.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.log('[REFERRALS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { referrerName, referrerEmail, friendEmail } = body;

    if (!friendEmail) {
      return new NextResponse("Friend's email is required", { status: 400 });
    }

    const referral = await prismadb.referral.create({
      data: {
        userId,
        referrerName: referrerName || "",
        referrerEmail: referrerEmail || "",
        friendEmail,
      }
    });

    return NextResponse.json(referral);
  } catch (error) {
    console.log('[REFERRALS_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 