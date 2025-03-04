export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const maxDuration = 4; // Maximum duration in minutes

    if (!categoryId) {
      return new NextResponse(JSON.stringify({ error: "Category ID is required" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // First, count how many videos are available
    const count = await prisma.content.count({
      where: { 
        categoryId: categoryId,
        type: "video",
        minutes_estimate: {
          lt: maxDuration
        }
      }
    });

    if (count === 0) {
      return new NextResponse(JSON.stringify({ error: "No suitable video content found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get a random skip value
    const skip = Math.floor(Math.random() * count);

    // Fetch a random video content using skip
    const content = await prisma.content.findFirst({
      where: { 
        categoryId: categoryId,
        type: "video",
        minutes_estimate: {
          lt: maxDuration
        }
      },
      include: {
        category: true
      },
      skip: skip,
      take: 1
    });

    if (!content) {
      return new NextResponse(JSON.stringify({ error: "No suitable video content found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new NextResponse(JSON.stringify(content), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[VIDEO_CONTENT_GET]', error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 