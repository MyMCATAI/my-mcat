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
  const limit = parseInt(searchParams.get("limit") || "10");
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
    let body = {};
    try {
      body = await req.json();
    } catch {
      console.log("Error parsing userTest post body");      
    }

    // Create a data object with only the required userId
    const data: { userId: string; testId?: string; passageId?: string } = {
      userId,
    };
    // Only add testId and passageId if they are provided
    if (body && typeof body === 'object') {
      if ('testId' in body && typeof body.testId === 'string') data.testId = body.testId;
      if ('passageId' in body && typeof body.passageId === 'string') data.passageId = body.passageId;
    }

    const userTest = await prisma.userTest.create({
      data,
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
