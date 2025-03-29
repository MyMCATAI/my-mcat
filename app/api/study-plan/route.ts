// app/api/study-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const studyPlan = await prisma.studyPlan.findFirst({
      where: { userId },
      orderBy: {
        creationDate: 'desc'
      }
    });
    
    return NextResponse.json({ studyPlan });
  } catch (error) {
    console.error('Error fetching study plan:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { examDate, resources, hoursPerDay, fullLengthDays } = await req.json();

    if (!examDate || !resources || !hoursPerDay || !fullLengthDays) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId,
        examDate: new Date(examDate),
        resources,
        hoursPerDay,
        fullLengthDays,
      },
    });

    return NextResponse.json(studyPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating study plan:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, examDate, resources, hoursPerDay, fullLengthDays } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Study plan ID is required" }, { status: 400 });
    }

    const updatedStudyPlan = await prisma.studyPlan.update({
      where: { id, userId },
      data: {
        examDate: examDate ? new Date(examDate) : undefined,
        resources,
        hoursPerDay,
        fullLengthDays,
      },
    });

    return NextResponse.json(updatedStudyPlan);
  } catch (error) {
    console.error('Error updating study plan:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const studyPlanId = searchParams.get('id');

  if (!studyPlanId) {
    return NextResponse.json({ error: "Study plan ID is required" }, { status: 400 });
  }

  try {
    await prisma.studyPlan.delete({
      where: { id: studyPlanId, userId },
    });

    return NextResponse.json({ message: "Study plan deleted successfully" });
  } catch (error) {
    console.error('Error deleting study plan:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}