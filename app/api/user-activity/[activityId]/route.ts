import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { endTime } = body;

    if (!endTime) {
      return new NextResponse("Missing end time", { status: 400 });
    }

    const existingActivity = await prismadb.userActivity.findFirst({
      where: {
        id: params.activityId,
        userId,
      },
    });

    if (!existingActivity) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Calculate duration in seconds
    const startTime = new Date(existingActivity.startTime);
    const endTimeDate = new Date(endTime);
    const durationSeconds = Math.floor((endTimeDate.getTime() - startTime.getTime()) / 1000);

    const updatedActivity = await prismadb.userActivity.update({
      where: {
        id: params.activityId,
      },
      data: {
        endTime: endTimeDate,
        duration: durationSeconds,
      },
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("[USER_ACTIVITY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { activityId: string } }
) {

  return PATCH(req, { params });
} 