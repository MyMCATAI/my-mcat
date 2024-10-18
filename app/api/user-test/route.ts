// app/api/user-test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "30");
  const skip = (page - 1) * limit;

  try {
    const userTests = await prisma.userTest.findMany({
      where: {
        userId,
        finishedAt: { not: null }, // This ensures only completed tests are returned
      },
      include: {
        test: {
          select: {
            title: true,
            description: true,
          },
        },
        responses: {
          select: {
            id: true,
            isReviewed: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
      skip,
      take: limit,
    });

    const totalCount = await prisma.userTest.count({
      where: {
        userId,
        finishedAt: { not: null },
      },
    });

    const userTestsWithCounts = userTests.map((test) => ({
      id: test.id,
      userId: test.userId,
      testId: test.testId,
      passageId: test.passageId,
      startedAt: test.startedAt,
      finishedAt: test.finishedAt,
      score: test.score,
      test: test.test,
      totalResponses: test.responses.length,
      reviewedResponses: test.responses.filter(r => r.isReviewed).length,
      isCompleted: true, // All tests returned are completed
    }));

    return NextResponse.json({
      userTests: userTestsWithCounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user tests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "Test ID is required" },
        { status: 400 }
      );
    }

    // Fetch the test to get the passageId
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { passageId: true },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const userTest = await prisma.userTest.create({
      data: {
        userId,
        testId,
        passageId: test.passageId, // Add the passageId to the userTest
      },
    });

    return NextResponse.json(userTest, { status: 201 });
  } catch (error) {
    console.error("Error creating user test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
