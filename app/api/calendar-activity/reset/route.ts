import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all calendar activities for the user
    await prisma.calendarActivity.deleteMany({
      where: { userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting calendar activities:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 