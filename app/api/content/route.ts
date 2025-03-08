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
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const contentId = searchParams.get('id');
    const conceptCategory = searchParams.get('conceptCategory')?.replace(/_/g, ' ') || '';
    const minDuration = 4

    if (contentId) {
      // Fetch a single content item by ID
      const content = await prisma.content.findUnique({
        where: { id: contentId,
        minutes_estimate: {
          gt: minDuration
        }
      },
        include: {
          category: true
        }
      });

      if (!content) {
        return new NextResponse(JSON.stringify({ error: "Content not found" }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new NextResponse(JSON.stringify(content), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (conceptCategory) {
      // First, find the category by conceptCategory name
      const category = await prisma.category.findFirst({
        where: { conceptCategory: conceptCategory }
      });

      if (!category) {
        return new NextResponse(JSON.stringify({ error: "Category not found" }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Then, fetch content items related to this category
      const skip = (page - 1) * pageSize;

      const content = await prisma.content.findMany({
        where: { categoryId: category.id, 
          minutes_estimate: {
            gte: minDuration
          }
        },
        skip,
        take: pageSize,
        include: {
          category: true
        }
      });

      const totalContent = await prisma.content.count({
        where: { categoryId: category.id }
      });

      return new NextResponse(JSON.stringify({
        content,
        totalPages: Math.ceil(totalContent / pageSize),
        currentPage: page,
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Fetch all content with pagination
      const skip = (page - 1) * pageSize;

      const content = await prisma.content.findMany({
        skip,
        take: pageSize,
        include: {
          category: true
        }
      });

      const totalContent = await prisma.content.count();

      return new NextResponse(JSON.stringify({
        content,
        totalPages: Math.ceil(totalContent / pageSize),
        currentPage: page,
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('[CONTENT_GET]', error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}