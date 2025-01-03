import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { generateCompletion } from '@/lib/ai-completion';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { dataPulseId } = body;

    if (!dataPulseId) {
      return NextResponse.json({ error: "Missing dataPulseId" }, { status: 400 });
    }

    // Get the section datapulse and all related question datapulses
    const sectionPulse = await prisma.dataPulse.findUnique({
      where: { 
        id: dataPulseId,
        userId,
        level: "section"
      },
      include: {
        fullLengthExam: true
      }
    });

    if (!sectionPulse) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Get all question datapulses for this section
    const questionPulses = await prisma.dataPulse.findMany({
      where: {
        userId,
        fullLengthExamId: sectionPulse.fullLengthExamId,
        section: sectionPulse.section,
        level: "contentCategory"
      }
    });

    if (questionPulses.length === 0) {
      return NextResponse.json({ error: "No questions found for analysis" }, { status: 400 });
    }

    // Calculate statistics
    const totalQuestions = questionPulses.length;
    const correctQuestions = questionPulses.filter(q => q.positive === 1).length;
    const wrongQuestions = questionPulses.filter(q => q.negative === 1).length;
    const flaggedQuestions = questionPulses.filter(q => q.positive === 0 && q.negative === 0).length;
    const accuracy = (correctQuestions / totalQuestions) * 100;

    // Group questions by topic/concept
    const topicStats = questionPulses.reduce((acc, q) => {
      if (!acc[q.name]) {
        acc[q.name] = { total: 0, wrong: 0, flagged: 0 };
      }
      acc[q.name].total++;
      if (q.negative === 1) acc[q.name].wrong++;
      if (q.positive === 0 && q.negative === 0) acc[q.name].flagged++;
      return acc;
    }, {} as Record<string, { total: number; wrong: number; flagged: number; }>);

    
    const prompt = `Analyze my MCAT ${sectionPulse.name} section performance and write a short analysis for me:

Score: ${sectionPulse.name === "CARS" ? sectionPulse.positive : accuracy.toFixed(1)}%
Questions: ${correctQuestions} correct, ${wrongQuestions} wrong, ${flaggedQuestions} flagged

Thought Process Analysis:
${questionPulses?.map((q, i) => `
Q${i + 1}:
Original: ${q.originalThoughtProcess || 'Not recorded'}
Corrected: ${q.correctedThoughtProcess || 'Not recorded'}
`).join('\n')}
`;

    // Generate the AI analysis
    const analysis = await generateCompletion(prompt);

    if (!analysis) {
      throw new Error("Failed to generate analysis");
    }

    // Update the section datapulse with the analysis
    const updatedPulse = await prisma.dataPulse.update({
      where: { id: dataPulseId },
      data: { aiResponse: analysis }
    });

    return NextResponse.json({ analysis });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
} 