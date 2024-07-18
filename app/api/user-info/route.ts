// File: app/api/user-info/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import { updateUserInfo } from "@/lib/user-info";

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