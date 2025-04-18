import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
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
    const passageId = searchParams.get('id');
    const decodedPassageId = passageId ? decodeURIComponent(passageId) : null;

    if (decodedPassageId) {
      // Fetch a single passage by ID with its questions
      const passage = await prisma.passage.findUnique({
        where: { id: decodedPassageId },
        include: {
          questions: {
            select: {
              id: true,
              questionID: true,
              questionContent: true,
              questionOptions: true,
              questionAnswerNotes: true,
              contentCategory: true,
              // Added fields from the Question model
              context: true,
              categoryId: true,
              difficulty: true,
              passageId: true,
            }
          }
        }
      });

      if (!passage) {
        return new NextResponse(JSON.stringify({ error: "Passage not found" }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new NextResponse(JSON.stringify(passage), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Existing code for fetching multiple passages
      const skip = (page - 1) * pageSize;

      const passages = await prisma.passage.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          text: true,
          citation: true,
        },
      });

      const totalPassages = await prisma.passage.count();

      return new NextResponse(JSON.stringify({
        passages,
        totalPages: Math.ceil(totalPassages / pageSize),
        currentPage: page,
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('[PASSAGES_GET]', error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
