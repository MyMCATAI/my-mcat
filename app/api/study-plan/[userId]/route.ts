// app/api/study-plan/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId: authUserId } = auth();
  if (!authUserId || authUserId !== params.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    const studyPlans = await prisma.studyPlan.findFirst({
      where: {
        userId: params.userId,
      },
      orderBy: {
        creationDate: 'desc',
      },
      skip,
      take: limit,
    });

    const totalCount = await prisma.studyPlan.count({
      where: { userId: params.userId }
    });

    return NextResponse.json({
      studyPlans,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching study plans:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId: authUserId } = auth();
  if (!authUserId || authUserId !== params.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, examDate, resources, hoursPerDay } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Study plan ID is required" }, { status: 400 });
    }

    const updatedStudyPlan = await prisma.studyPlan.update({
      where: { id, userId: params.userId },
      data: {
        examDate: examDate ? new Date(examDate) : undefined,
        resources,
        hoursPerDay,
      },
    });

    return NextResponse.json(updatedStudyPlan);
  } catch (error) {
    console.error('Error updating study plan:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId: authUserId } = auth();
  if (!authUserId || authUserId !== params.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const studyPlanId = searchParams.get('id');

  if (!studyPlanId) {
    return NextResponse.json({ error: "Study plan ID is required" }, { status: 400 });
  }

  try {
    await prisma.studyPlan.delete({
      where: { id: studyPlanId, userId: params.userId },
    });

    return NextResponse.json({ message: "Study plan deleted successfully" });
  } catch (error) {
    console.error('Error deleting study plan:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}