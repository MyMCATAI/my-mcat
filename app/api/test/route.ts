import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const testId = searchParams.get('id');

    if (testId) {
      // Fetch a single test by ID with its questions
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          questions: {
            include: {
              question: {
                select: {
                  id: true,
                  questionID: true,
                  questionContent: true,
                  questionOptions: true,
                  questionAnswerNotes: true,
                  contentCategory: true,
                  passageId: true
                }
              }
            }
          },
        }
      });

      if (!test) {
        return new NextResponse(JSON.stringify({ error: "Test not found" }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new NextResponse(JSON.stringify(test), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Fetch multiple tests
      const skip = (page - 1) * pageSize;

      const tests = await prisma.test.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          setName: true,
          _count: {
            select: { questions: true }
          }
        },
      });

      const totalTests = await prisma.test.count();

      return new NextResponse(JSON.stringify({
        tests,
        totalPages: Math.ceil(totalTests / pageSize),
        currentPage: page,
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('[TESTS_GET]', error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}