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

    const activity = await prismadb.userActivity.create({
      data: {
        userId,
        type,
        location,
        metadata: metadata || {},
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("[USER_ACTIVITY_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 