// app/api/user-test/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const { searchParams } = new URL(req.url);
  const includeQuestionInfo =
    searchParams.get("includeQuestionInfo") === "true";

  try {
    const userTest = await prisma.userTest.findUnique({
      where: { id },
      include: {
        test: {
          select: {
            title: true,
            description: true,
            questions: includeQuestionInfo
              ? {
                  include: {
                    question: {
                      include: {
                        category: true, // Include category info when question info is requested
                      },
                    },
                  },
                }
              : false,
          },
        },
        responses: {
          include: {
            question: {
              select: {
                id: true,
                passageId: true,
                ...(includeQuestionInfo
                  ? {
                      questionContent: true,
                      questionOptions: true,
                      questionAnswerNotes: true,
                      context: true,
                      categoryId: true,
                      contentCategory: true,
                      questionID: true,
                      difficulty: true,
                      links: true,
                      tags: true,
                      types: true,
                      states: true,
                      contentId: true,
                      category: true,
                    }
                  : {
                      category: false,
                      questionOptions: false,
                      questionAnswerNotes: false,
                    }),
              },
            },
          },
        },
      },
    });

    if (!userTest) {
      return NextResponse.json(
        { error: "User test not found" },
        { status: 404 }
      );
    }

    if (userTest.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("userTest", userTest);
    return NextResponse.json(userTest);
  } catch (error) {
    console.error("Error fetching user test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { score, finishedAt, earnedCoin } = body;

    // Verify the test belongs to the user
    const userTest = await prisma.userTest.findUnique({
      where: {
        id: params.id,
        userId,
      },
      include: {
        test: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!userTest) {
      return new NextResponse("Test not found or unauthorized", {
        status: 404,
      });
    }

    // Update the test
    const updatedTest = await prisma.userTest.update({
      where: {
        id: params.id,
      },
      data: {
        score,
        finishedAt,
        earnedCoin,
      },
      include: {
        test: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error("[USER_TEST_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
