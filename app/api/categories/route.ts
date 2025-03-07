export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');

    if (!section) {
      return NextResponse.json({ error: "Section parameter is required" }, { status: 400 });
    }

    // Fetch categories for the specified section
    const categories = await prisma.category.findMany({
      where: {
        section: section,
      },
      select: {
        id: true,
        conceptCategory: true,
        contentCategory: true,
        section: true,
      },
      orderBy: {
        conceptCategory: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 