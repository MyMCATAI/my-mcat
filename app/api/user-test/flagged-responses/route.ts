import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userTestId, questionId, flagged } = body;

    if (!userTestId || !questionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the UserResponse exists or create a new one
    let userResponse = await prisma.userResponse.findFirst({
      where: { userTestId, questionId },
    });

    if (!userResponse) {
      userResponse = await prisma.userResponse.create({
        data: {
          userId,
          userAnswer: "",
          isCorrect: false,
          userTest: {
            connect: { id: userTestId }
          },
          question: { 
            connect: { id: questionId } 
          }
        },
      });
    }

    // Update the flagged status
    userResponse = await prisma.userResponse.update({
      where: { id: userResponse.id },
      data: { flagged },
    });

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("[USER_TEST_FLAGGED_RESPONSES_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
