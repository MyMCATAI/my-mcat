// File: app/api/user-info/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { getUserInfo } from "@/lib/user-info";
import { incrementUserScore } from "@/lib/user-info";
import prismadb from "@/lib/prismadb";
import { DEFAULT_BIO } from "@/constants";

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userInfo = await getUserInfo();

    if (!userInfo) {
      return new NextResponse("User info not found", { status: 404 });
    }

    return NextResponse.json(userInfo);
  } catch (error) {
    console.log('[USER_INFO_GET]', error);
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
    const { firstName, bio } = body;

    // Create or update UserInfo matching our schema exactly
    const userInfo = await prismadb.userInfo.upsert({
      where: { userId },
      create: {
        userId,
        bio: bio || DEFAULT_BIO,
        firstName: firstName || "",
        apiCount: 0,
        score: 0,
        clinicRooms: "",
        hasPaid: false,
        subscriptionType: "",
        diagnosticScores: {
          total: "",
          cp: "",
          cars: "",
          bb: "",
          ps: ""
        }
      },
      update: {
        firstName: firstName || "",
        bio: bio || DEFAULT_BIO,
      }
    });

    return NextResponse.json(userInfo);
  } catch (error) {
    console.log('[USER_INFO_INITIALIZE_POST]', error);
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