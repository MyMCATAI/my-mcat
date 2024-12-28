import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

// GET - Fetch user activities
export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query: any = { userId };
    if (type) query.type = type;
    if (from) query.startTime = { gte: new Date(from) };
    if (to) query.startTime = { ...query.startTime, lte: new Date(to) };

    const activities = await prismadb.userActivity.findMany({
      where: query,
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[USER_ACTIVITY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST - Create new activity
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { type, location, metadata } = body;

    if (!type || !location) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Use transaction to ensure both operations complete together
    const result = await prismadb.$transaction(async (tx) => {
      // Find most recent unfinished activity
      const lastActivity = await tx.userActivity.findFirst({
        where: {
          userId,
          endTime: null
        },
        orderBy: {
          startTime: 'desc'
        }
      });

      // If unfinished activity exists, update it
      if (lastActivity) {
        console.log("cleaning up last activity")
        const now = new Date();
        await tx.userActivity.update({
          where: { id: lastActivity.id },
          data: {
            endTime: now,
            duration: Math.floor((now.getTime() - lastActivity.startTime.getTime()) / 1000)
          }
        });
      }

      const newActivity = await tx.userActivity.create({
        data: {
          userId,
          type,
          location,
          metadata: metadata || {},
        }
      });

      return newActivity;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[USER_ACTIVITY_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 