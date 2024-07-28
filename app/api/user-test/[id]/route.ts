// app/api/user-test/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
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

  try {
    const userTest = await prisma.userTest.findUnique({
      where: { id },
      include: {
        test: {
          select: {
            title: true,
            description: true,
            questions: {
              include: {
                question: true,
              },
            },
          },
        },
        responses: {
          include: {
            question: true,
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