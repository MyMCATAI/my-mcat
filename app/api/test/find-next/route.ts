import { NextResponse } from 'next/server';
import prisma from "@/lib/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return NextResponse.json({ error: 'Title parameter is required' }, { status: 400 });
  }

  // Remove " - Part 1" from the title and prepare the part 2 title
  const baseTitlePart1 = title.replace(/\s*-\s*Part\s*1\s*$/i, '').trim();
  const titlePart2 = `${baseTitlePart1} - Part 2`;

  try {
    const nextTest = await prisma.test.findFirst({
      where: {
        title: titlePart2
      }
    });

    if (nextTest) {
      return NextResponse.json(nextTest);
    } else {
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error('Error finding next test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
