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

    return NextResponse.json({
      passages,
      totalPages: Math.ceil(totalPassages / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.log('[PASSAGES_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}