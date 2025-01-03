import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

// GET - Fetch questions for a specific exam and section
export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');
    const section = searchParams.get('section');
    const level = searchParams.get('level') || 'conceptCategory';

    if (!examId) {
      return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
    }

    const query = {
      where: {
        userId,
        fullLengthExamId: examId,
        level,
        section: section
      },
      orderBy: {
        createdAt: 'desc' as const
      }
    };

    const questions = await prisma.dataPulse.findMany(query);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching exam questions:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new question
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received request body:', body);

    const { 
      examId,
      questionNumber,
      categoryId,
      mistake,
      improvement,
      status,
      level = 'conceptCategory',
      questionText = '',
      answerText = ''
    } = body;

    // Validate required fields
    if (!examId) {
      return NextResponse.json({ 
        error: "Missing required field: examId",
        received: body
      }, { status: 400 });
    }

    if (!questionNumber) {
      return NextResponse.json({ 
        error: "Missing required field: questionNumber",
        received: body
      }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ 
        error: "Missing required field: categoryId",
        received: body
      }, { status: 400 });
    }

    // Get the category to use its conceptCategory as the name
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const question = await prisma.dataPulse.create({
      data: {
        userId,
        name: category.contentCategory,
        level,
        section: category.section,
        fullLengthExamId: examId,
        questionText: questionNumber,
        answerText: answerText || null,
        originalThoughtProcess: mistake || null,
        correctedThoughtProcess: improvement || null,
        positive: status === 'correct' ? 1 : 0,
        negative: status === 'wrong' ? 1 : 0,
        source: "exam_question",
        weight: 1
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error creating exam question:', error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update an existing question
export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      id,
      questionNumber,
      categoryId,
      mistake,
      improvement,
      status,
      level = 'conceptCategory'
    } = body;

    if (!id || !questionNumber || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get the category to use its conceptCategory as the name
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const question = await prisma.dataPulse.update({
      where: {
        id,
        userId // Ensure user can only update their own questions
      },
      data: {
        name: category.conceptCategory,
        level,
        questionText: questionNumber,
        originalThoughtProcess: mistake,
        correctedThoughtProcess: improvement,
        positive: status === 'correct' ? 1 : 0,
        negative: status === 'wrong' ? 1 : 0,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error updating exam question:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove a question
export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    await prisma.dataPulse.delete({
      where: {
        id,
        userId // Ensure user can only delete their own questions
      }
    });

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error('Error deleting exam question:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 