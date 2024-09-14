// File: app/api/user-info/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import { updateUserInfo } from "@/lib/user-info";
import { incrementUserScore } from "@/lib/user-info";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { bio } = body;

    const updatedInfo = await updateUserInfo({ bio });

    return NextResponse.json(updatedInfo);
  } catch (error) {
    console.log('[USER_INFO_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


export async function PUT(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    if (typeof amount !== 'number' || isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const updatedInfo = await incrementUserScore(amount);

    return NextResponse.json({ score: updatedInfo.score });
  } catch (error) {
    console.error('[USER_INFO_SCORE_PUT]', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}