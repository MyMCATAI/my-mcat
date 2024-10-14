// app/api/test/search-route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  console.log("GET request for searching tests");

  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("search") || "";

    // Fetch tests that match the search query and include UserTest for the current user
    const tests = await prisma.test.findMany({
      where: {
        title: {
          contains: searchQuery,
        },
      },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                questionContent: true,
                questionOptions: true,
                questionAnswerNotes: true,
                context: true,
                passageId: true,
                categoryId: true,
                contentCategory: true,
                questionID: true,
                difficulty: true,
              },
            },
          },
        },
        userTests: {
          where: {
            userId: userId, // Only get UserTests for the current user
          },
          select: {
            id: true,
            userId: true,
            testId: true,
            passageId: true,
            startedAt: true,
            finishedAt: true,
            score: true,
            responses: {
              select: {
                id: true,
                userId: true,
                userTestId: true,
                questionId: true,
                userAnswer: true,
                isCorrect: true,
                categoryId: true,
                timeSpent: true,
                weighting: true,
                userNotes: true,
                reviewNotes: true,
                answeredAt: true,
                isReviewed: true,
                flagged: true,
              },
            },
          },
        },
      },
    });

    return new NextResponse(
      JSON.stringify({
        tests,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[SEARCH_TESTS_GET]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
