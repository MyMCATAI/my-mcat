// app/api/user-test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    const userTests = await prisma.userTest.findMany({
      where: { userId },
      include: {
        test: {
          select: {
            title: true,
            description: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      skip,
      take: limit,
    });

    const totalCount = await prisma.userTest.count({ where: { userId } });

    return NextResponse.json({
      userTests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching user tests:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { testId } = await req.json();

    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    const userTest = await prisma.userTest.create({
      data: {
        userId,
        testId,
      },
    });

    return NextResponse.json(userTest, { status: 201 });
  } catch (error) {
    console.error('Error creating user test:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}