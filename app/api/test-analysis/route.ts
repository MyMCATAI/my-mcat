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
    const { examId } = body;

    if (!examId) {
      return NextResponse.json({ error: "Missing examId" }, { status: 400 });
    }

    // Get the full length exam with all its datapulses
    const exam = await prisma.fullLengthExam.findUnique({
      where: { 
        id: examId,
        userId,
      },
      include: {
        dataPulses: true
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Separate section datapulses and question datapulses
    const sectionPulses = exam.dataPulses.filter(p => p.level === "section");
    const questionPulses = exam.dataPulses.filter(p => p.level === "contentCategory");

    if (sectionPulses.length === 0) {
      return NextResponse.json({ error: "No section scores found" }, { status: 400 });
    }

    // Group questions by section
    const questionsBySection = questionPulses.reduce((acc, q) => {
      if (!acc[q.section || '']) {
        acc[q.section || ''] = [];
      }
      acc[q.section || ''].push(q);
      return acc;
    }, {} as Record<string, typeof questionPulses>);

    // Calculate section statistics
    const sectionStats = sectionPulses.map(section => {
      const sectionQuestions = questionsBySection[section.name] || [];
      const totalQuestions = sectionQuestions.length;
      const correctQuestions = sectionQuestions.filter(q => q.positive === 1).length;
      const wrongQuestions = sectionQuestions.filter(q => q.negative === 1).length;
      const flaggedQuestions = sectionQuestions.filter(q => q.positive === 0 && q.negative === 0).length;
      
      return {
        name: section.name,
        score: section.positive, // This is the scaled score (118-132)
        questions: {
          total: totalQuestions,
          correct: correctQuestions,
          wrong: wrongQuestions,
          flagged: flaggedQuestions
        }
      };
    });

    const prompt = `You're Kalypso, the friendly AI cat. Analyze my MCAT test performance for me, here are details on my scores:

Scoring Context:
- MCAT scores range from 118 (lowest) to 132 (perfect) per section
- 125 is considered average
- 128+ is considered competitive
- 130+ is considered exceptional

Section Scores:
${sectionStats.map(section => 
  `${section.name}: ${section.score}/132 (${section.questions.correct} correct, ${section.questions.wrong} wrong, ${section.questions.flagged} flagged)`
).join('\n')}

Question Analysis by Section:
${sectionStats.map(section => {
  const sectionQuestions = questionsBySection[section.name] || [];
  return `
${section.name} Common Mistakes:
${sectionQuestions
  .filter(q => q.negative === 1)
  .map(q => `- ${q.originalThoughtProcess || 'No thought process recorded'}`)
  .join('\n')}
`;
}).join('\n')}

Provide me a concise analysis of my strongest and weakest sections and what my common errors or mistakes are. At the end, provide me a big general takeaway for my next exam. Remember: you're on MyMCAT.ai as a website. The Adaptive Tutoring Suite is where students go to learn content, and you should recommend that for lower scorers. There's also an Anki game, which you recommend for Psychology/Sociology specifically. Generally, for lower scores, it's content and application of content. For higher scores, it's more about doing practice problems and applying content. For very high scorers, recommend spending less time on content and practice and more time doing third party prep.`;

    // Generate the AI analysis
    const analysis = await generateCompletion(prompt);

    if (!analysis) {
      throw new Error("Failed to generate analysis");
    }

    // Update the exam with the analysis
    const updatedExam = await prisma.fullLengthExam.update({
      where: { id: examId },
      data: { aiResponse: analysis }
    });

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Error generating test analysis:', error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
} 