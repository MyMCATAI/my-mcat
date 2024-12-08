import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

// GET - Fetch a single DataPulse or list of DataPulses
export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const source = searchParams.get('source');

    if (id) {
      // Fetch single DataPulse with userId check
      const dataPulse = await prisma.dataPulse.findUnique({
        where: { 
          id,
          userId
        }
      });

      if (!dataPulse) {
        return NextResponse.json({ error: "DataPulse not found" }, { status: 404 });
      }

      return NextResponse.json(dataPulse);
    }

    // Fetch all DataPulses for specific user with optional source filter
    const dataPulses = await prisma.dataPulse.findMany({
      where: { 
        userId,
        ...(source ? { source } : {}) // Only include source filter if provided
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(dataPulses);
  } catch (error) {
    console.error('Error fetching DataPulse:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new DataPulse
export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, level, weight, source, notes } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
    }

    const newDataPulse = await prisma.dataPulse.create({
      data: {
        userId,
        name,
        level: level || "conceptCategory",
        weight: weight || 1,
        source: source || "UWorld",
        notes: notes || "",
      }
    });

    return NextResponse.json(newDataPulse);
  } catch (error) {
    console.error('Error creating DataPulse:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update an existing DataPulse
export async function PUT(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
    }

    const updatedDataPulse = await prisma.dataPulse.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedDataPulse);
  } catch (error) {
    console.error('Error updating DataPulse:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove a DataPulse
export async function DELETE(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 });
    }

    await prisma.dataPulse.delete({
      where: { id }
    });

    return NextResponse.json({ message: "DataPulse deleted successfully" });
  } catch (error) {
    console.error('Error deleting DataPulse:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
