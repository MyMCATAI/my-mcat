// File: app/api/categories/route.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import { getCategories } from "@/lib/category"; 

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const result = await getCategories({ page, pageSize });

    return NextResponse.json(result);
  } catch (error) {
    console.log('[CATEGORIES_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
