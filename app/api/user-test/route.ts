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
    const whereClause = {
      userId,
      finishedAt: { not: null },
      testId: { not: null },
      test: {
        questions: {
          some: {
            question: {
              category: {
                subjectCategory: "CARs"
              }
            }
          }
        }
      }
    };

    const userTests = await prisma.userTest.findMany({
      where: whereClause,
      include: {
        test: {
          select: {
            id: true,
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

    const problematicTests = userTests.filter(test => !test.test?.title);
    if (problematicTests.length > 0) {
      console.error("Found tests without titles:", problematicTests.map(t => ({id: t.id, testId: t.testId})));
    }

    const totalCount = await prisma.userTest.count({
      where: whereClause
    });

    const userTestsWithCounts = userTests
      .filter((userTest) => userTest.test?.title)
      .map((userTest) => ({
        id: userTest.id,
        userId: userTest.userId,
        testId: userTest.testId,
        passageId: userTest.passageId,
        startedAt: userTest.startedAt,
        finishedAt: userTest.finishedAt,
        score: userTest.score,
        test: userTest.test,
        totalResponses: userTest.responses.length,
        reviewedResponses: userTest.responses.filter((response) => response.isReviewed).length,
        isCompleted: true,
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

    // If testId is provided, fetch the test to get its passageId
    if (body && typeof body === 'object' && 'testId' in body && typeof body.testId === 'string') {
      data.testId = body.testId;
      
      const test = await prisma.test.findUnique({
        where: { id: body.testId },
        select: { passageId: true }
      });
      
      if (test?.passageId) {
        data.passageId = test.passageId;
      }
    } else if (body && typeof body === 'object' && 'passageId' in body && typeof body.passageId === 'string') {
      data.passageId = body.passageId;
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
