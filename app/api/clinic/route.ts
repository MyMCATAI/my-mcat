import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userInfo = await prisma.userInfo.findUnique({
      where: { userId },
    });

    if (!userInfo) {
      console.log('[CLINIC_ROOMS_GET] User not found:', userId);
      return new NextResponse(JSON.stringify({ error: "User not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const rooms = userInfo.clinicRooms ? JSON.parse(userInfo.clinicRooms) : [];
    console.log('[CLINIC_ROOMS_GET] Rooms retrieved for user:', userId, 'Rooms:', rooms);

    return new NextResponse(JSON.stringify(rooms), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[CLINIC_ROOMS_GET]', error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { room } = body;

    console.log('[CLINIC_ROOMS_POST] Received request:', { userId, room });

    if (!room) {
      console.log('[CLINIC_ROOMS_POST] Room name is required');
      return new NextResponse(JSON.stringify({ error: "Room name is required" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validRooms = [
      "Basic Rooms",
      "Examination and Bathrooms",
      "High Care Rooms",
      "Operating Suite",
      "Additional MRI",
      "CAT-Scan Suite"
    ];

    if (!validRooms.includes(room)) {
      console.log('[CLINIC_ROOMS_POST] Invalid room name:', room);
      return new NextResponse(JSON.stringify({ error: "Invalid room name" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userInfo = await prisma.userInfo.findUnique({
      where: { userId },
      select: { clinicRooms: true }
    });

    if (!userInfo) {
      console.log('[CLINIC_ROOMS_POST] User not found:', userId);
      return new NextResponse(JSON.stringify({ error: "User not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentRooms = userInfo.clinicRooms ? JSON.parse(userInfo.clinicRooms) : [];

    if (currentRooms.includes(room)) {
      console.log('[CLINIC_ROOMS_POST] Room already exists:', room);
      return new NextResponse(JSON.stringify({ error: "Room already exists" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updatedRooms = [...currentRooms, room];

    await prisma.userInfo.update({
      where: { userId },
      data: { clinicRooms: JSON.stringify(updatedRooms) }
    });

    console.log('[CLINIC_ROOMS_POST] Updated rooms for user:', userId, 'New rooms:', updatedRooms);

    return new NextResponse(JSON.stringify(updatedRooms), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[CLINIC_ROOMS_POST]', error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}