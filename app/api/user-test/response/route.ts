// File: app/api/user-test/response/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

const delimiter = "|||";

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) {
    console.log("Unauthorized request: No userId");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userTestId = searchParams.get("userTestId");
  const questionId = searchParams.get("questionId");

  if (!userTestId || !questionId) {
    return NextResponse.json(
      { error: "Missing required query parameters" },
      { status: 400 }
    );
  }

  try {
    const existingResponse = await prisma.userResponse.findFirst({
      where: {
        userTestId,
        questionId,
        userId,
      },
    });

    if (!existingResponse) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(existingResponse);
  } catch (error) {
    console.error("Error fetching user response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    console.log("Unauthorized request: No userId");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      userTestId,
      questionId, 
      userAnswer,
      isCorrect,
      timeSpent,
      userNotes,
    } = body;

    // Only validate questionId as required
    if (!questionId) {
      console.log("Missing required field: questionId");
      return NextResponse.json(
        { error: "Missing required field: questionId" },
        { status: 400 }
      );
    }

    // First, fetch the question to get its categoryId
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { categoryId: true },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const timestamp = new Date().toISOString();
    let formattedNote = "";
    if (userNotes) {
      let notes = userNotes.split(delimiter);
      for (let note of notes) {
        formattedNote += `[${timestamp}] - ${note}${delimiter}`;
      }
    }

    // Find existing response
    const existingResponse = await prisma.userResponse.findFirst({
      where: {
        userId,
        questionId,
        userTestId,
      },
    });

    let response;
    if (existingResponse) {
      // Update existing response
      response = await prisma.userResponse.update({
        where: {
          id: existingResponse.id,
        },
        data: {
          userAnswer: userAnswer || "",
          isCorrect: isCorrect !== undefined ? isCorrect : undefined,
          timeSpent: timeSpent || undefined,
          userNotes: formattedNote ? {
            set: formattedNote
          } : undefined,
          answeredAt: new Date(),
        },
        include: {
          question: true,
          userTest: true,
          Category: true,
        },
      });
    } else {
      // Create new response
      response = await prisma.userResponse.create({
        data: {
          userId,
          userTestId,
          questionId,
          categoryId: question.categoryId,
          userAnswer: userAnswer || "",
          isCorrect: isCorrect || false,
          timeSpent: timeSpent || 0,
          userNotes: formattedNote,
          answeredAt: new Date(),
        },
        include: {
          question: true,
          userTest: true,
          Category: true,
        },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error handling user response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, userTestId, questionId, flagged, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    // Fetch the existing response to retrieve current notes
    const existingResponse = await prisma.userResponse.findUnique({
      where: { id, userId },
      select: { userNotes: true, reviewNotes: true },
    });

    if (!existingResponse) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    // Append
    if (updateData.userNotes) {
      const timestamp = new Date().toISOString();
      let formattedNote = "";
      let notes = updateData.userNotes.split(delimiter);

      for (let note of notes) {
        formattedNote += `[${timestamp}] - ${note}${delimiter}`;
      }

      const updatedUserNotes = existingResponse.userNotes
        ? `${existingResponse.userNotes}${formattedNote}`
        : formattedNote;
      updateData.userNotes = updatedUserNotes;
    }

    if (updateData.reviewNotes) {
      const timestamp = new Date().toISOString();
      const formattedNote = `[${timestamp}] - ${updateData.reviewNotes}`;
      const updatedReviewNotes = existingResponse.reviewNotes
        ? `${existingResponse.reviewNotes}${delimiter}${formattedNote}`
        : formattedNote;
      updateData.reviewNotes = updatedReviewNotes;
    }

    // Conditionally add flagged to updateData if it is present in the request body
    if (typeof flagged !== 'undefined') {
      updateData.flagged = flagged;
    }

    // Update the response
    const updatedResponse = await prisma.userResponse.update({
      where: { id, userId },
      data: {
        ...updateData,
        answeredAt: new Date(),
      },
      include: {
        question: true,
        userTest: true,
        Category: true,
      },
    });

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error("Error updating user response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
