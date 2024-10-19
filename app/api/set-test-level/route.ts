import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { rooms } = body;

    if (!Array.isArray(rooms)) {
      return new NextResponse(JSON.stringify({ error: "Invalid rooms data" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await prisma.userInfo.update({
      where: { userId },
      data: { clinicRooms: JSON.stringify(rooms) }
    });

    return new NextResponse(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[SET_TEST_LEVEL]', error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

