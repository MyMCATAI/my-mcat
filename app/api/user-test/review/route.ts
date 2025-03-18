import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { TASK_REWARDS } from "@/lib/coin/constants";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userTestId } = body;

    if (!userTestId) {
      return NextResponse.json({ error: "Missing required field: userTestId" }, { status: 400 });
    }

    // Fetch the user test
    const userTest = await prisma.userTest.findUnique({
      where: { id: userTestId, userId },
    });

    if (!userTest) {
      return NextResponse.json({ error: "User test not found" }, { status: 404 });
    }

    // Check if the test has already been reviewed
    if (userTest.reviewedAt) {
      return NextResponse.json({
        message: "This test has already been reviewed. No additional points awarded.",
        alreadyReviewed: true
      });
    }

    // Fetch existing UserInfo
    const existingUserInfo = await prisma.userInfo.findUnique({
      where: { userId },
    });

    if (!existingUserInfo) {
      return NextResponse.json({ error: "User info not found" }, { status: 404 });
    }

    // Update the user test with reviewedAt timestamp
    const updatedUserTest = await prisma.userTest.update({
      where: { id: userTestId },
      data: { reviewedAt: new Date() },
    });

    // Increment user score
    const updatedUserInfo = await prisma.userInfo.update({
      where: { userId },
      data: { score: { increment: TASK_REWARDS.COMPLETE_REVIEW } },
    });

    return NextResponse.json({
      message: "Review completed successfully.",
      updatedUserTest
    });

  } catch (error) {
    console.error('Error completing review:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}