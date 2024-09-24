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
    const { room, cost } = body;

    console.log('[CLINIC_ROOMS_POST] Received request:', { userId, room, cost });

    if (!room || typeof cost !== 'number') {
      console.log('[CLINIC_ROOMS_POST] Room name and cost are required');
      return new NextResponse(JSON.stringify({ error: "Room name and cost are required" }), { 
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
      select: { score: true, clinicRooms: true }
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

    if (userInfo.score < cost) {
      console.log('[CLINIC_ROOMS_POST] Insufficient funds:', userInfo.score, 'Required:', cost);
      return new NextResponse(JSON.stringify({ error: "Insufficient funds" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updatedRooms = [...currentRooms, room];
    const updatedScore = userInfo.score - cost;

    const updatedUserInfo = await prisma.userInfo.update({
      where: { userId },
      data: { 
        clinicRooms: JSON.stringify(updatedRooms),
        score: updatedScore
      },
      select: { clinicRooms: true, score: true }
    });

    console.log('[CLINIC_ROOMS_POST] Updated rooms for user:', userId, 'New rooms:', updatedRooms, 'New score:', updatedScore);

    return new NextResponse(JSON.stringify({ 
      rooms: JSON.parse(updatedUserInfo.clinicRooms), 
      score: updatedUserInfo.score 
    }), { 
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

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { room } = body;

    console.log('[CLINIC_ROOMS_DELETE] Received request:', { userId, room });

    if (!room) {
      console.log('[CLINIC_ROOMS_DELETE] Room name is required');
      return new NextResponse(JSON.stringify({ error: "Room name is required" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userInfo = await prisma.userInfo.findUnique({
      where: { userId },
      select: { clinicRooms: true }
    });

    if (!userInfo) {
      console.log('[CLINIC_ROOMS_DELETE] User not found:', userId);
      return new NextResponse(JSON.stringify({ error: "User not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentRooms = userInfo.clinicRooms ? JSON.parse(userInfo.clinicRooms) : [];

    if (!currentRooms.includes(room)) {
      console.log('[CLINIC_ROOMS_DELETE] Room not found:', room);
      return new NextResponse(JSON.stringify({ error: "Room not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updatedRooms = currentRooms.filter((r: string) => r !== room);

    await prisma.userInfo.update({
      where: { userId },
      data: { clinicRooms: JSON.stringify(updatedRooms) }
    });

    console.log('[CLINIC_ROOMS_DELETE] Updated rooms for user:', userId, 'New rooms:', updatedRooms);

    return new NextResponse(JSON.stringify(updatedRooms), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[CLINIC_ROOMS_DELETE]', error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

