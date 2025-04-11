import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { uworldMapping } from '@/constants/uworld';

interface UWorldTask {
  subject: string;
  correctAnswers: number;
  incorrectAnswers: number;
  completed: boolean;
  text: string;
}

// POST - Create DataPulses from UWorld tasks
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tasks } = body;

    if (!Array.isArray(tasks)) {
      return NextResponse.json({ error: "Invalid tasks data" }, { status: 400 });
    }

    const dataPulses = [];

    for (const task of tasks) {
      // Get content categories from mapping
      const contentCategories = uworldMapping[task.subject] || [];
      
      // If there are multiple categories, split the scores evenly
      const numCategories = contentCategories.length;
      const splitCorrect = Math.round(task.correctAnswers / numCategories);
      const splitIncorrect = Math.round(task.incorrectAnswers / numCategories);
      
      // Create a DataPulse for each content category mapping
      for (const category of contentCategories) {
        try {
          const dataPulse = await prisma.dataPulse.create({
            data: {
              userId,
              name: category,
              level: "contentCategory",
              weight: 1,
              source: "UWorld",
              positive: splitCorrect,
              negative: splitIncorrect,
              notes: `UWorld Task: ${task.text}${numCategories > 1 ? ` (Split ${numCategories} ways)` : ''}`,
            }
          });
          dataPulses.push(dataPulse);
        } catch (error) {
          console.error(`Error creating DataPulse for ${task.subject}:`, error);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      dataPulses,
      message: `Created ${dataPulses.length} DataPulses from UWorld tasks`
    });

  } catch (error) {
    console.error('Error processing UWorld tasks:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 