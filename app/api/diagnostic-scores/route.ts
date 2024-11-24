import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { diagnosticScores } = body;
    
    const updatedInfo = await prisma.userInfo.update({
      where: { userId },
      data: { 
        diagnosticScores: diagnosticScores as Prisma.InputJsonValue
      }
    });

    return NextResponse.json(updatedInfo);
  } catch (error) {
    console.log('[DIAGNOSTIC_SCORES_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}