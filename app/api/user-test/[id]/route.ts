// app/api/user-test/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
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
  const includeQuestionInfo = searchParams.get('includeQuestionInfo') === 'true';

  try {
    const userTest = await prisma.userTest.findUnique({
      where: { id },
      include: {
        test: {
          select: {
            title: true,
            description: true,
            questions: includeQuestionInfo ? {
              include: {
                question: {
                  include: {
                    category: true  // Include category info when question info is requested
                  }
                },
              },
            } : false,
          },
        },
        responses: {
          include: {
            question: {
              select: {
                id: true,
                passageId: true,
                ...(includeQuestionInfo ? {
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
                  category: true
                } : {
                  category: false,
                  questionOptions: false,
                  questionAnswerNotes: false
                })
              }
            },
          },
        },
      },
    });

    if (!userTest) {
      return NextResponse.json({ error: "User test not found" }, { status: 404 });
    }

    if (userTest.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(userTest);
  } catch (error) {
    console.error('Error fetching user test:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const { score, finishedAt } = body;

    if (typeof score !== 'number' || !finishedAt) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // First, check if the user test exists and belongs to the current user
    const existingUserTest = await prisma.userTest.findUnique({
      where: { id },
    });

    if (!existingUserTest) {
      return NextResponse.json({ error: "User test not found" }, { status: 404 });
    }

    if (existingUserTest.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the user test
    const updatedUserTest = await prisma.userTest.update({
      where: { id },
      data: {
        score,
        finishedAt: new Date(finishedAt),
      },
    });

    return NextResponse.json(updatedUserTest);
  } catch (error) {
    console.error('Error updating user test:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}