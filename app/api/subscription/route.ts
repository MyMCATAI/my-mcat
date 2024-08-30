// File: app/api/subscription/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import { checkSubscription } from "@/lib/subscription";
import { getUserInfo } from "@/lib/user-info";

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isPro = await checkSubscription();
    
    const userInfo = await getUserInfo();

    return NextResponse.json({ isPro, userInfo });
  } catch (error) {
    console.log('[SUBSCRIPTION_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}