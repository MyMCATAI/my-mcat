import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import dotenv from 'dotenv';
import cliProgress from 'cli-progress';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

function normalizeValue(value: any): string[] {
  if (typeof value === 'string') {
    try {
      // Try to parse if it's a JSON string
      return JSON.parse(value);
    } catch {
      // If not JSON, return as single item array
      return [value];
    }
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

async function processBatch(
  questions: any[], 
  progressBar: cliProgress.SingleBar,
  matchingQuestions: Set<{
    id: string, 
    content: string,
    options: string[], 
    notes: string[]
  }>
) {
  questions.forEach((question) => {
    try {
      const options = normalizeValue(question.questionOptions);
      const notes = normalizeValue(question.questionAnswerNotes);

      // Debug log for first few questions
      if (matchingQuestions.size < 3) {
        console.log('\nDebug for question', question.id);
        console.log('Options:', options);
        console.log('Notes:', notes);
      }

      // Check if arrays have same length and same content
      const optionsMatch = 
        options.length === notes.length && 
        options.every((opt: string, idx: number) => opt === notes[idx]);

      if (optionsMatch) {
        matchingQuestions.add({
          id: question.id,
          content: question.questionContent,
          options: options,
          notes: notes
        });
      }
    } catch (error) {
      console.error(`Error processing question ${question.id}:`, error);
    } finally {
      progressBar.increment();
    }
  });
}

async function findMatchingQuestions() {
  const matchingQuestions = new Set<{
    id: string, 
    content: string,
    options: string[], 
    notes: string[]
  }>();
  const BATCH_SIZE = 50;
  
  try {
    const questions = await prisma.question.findMany({
      where: {
        types: {
          not: 'FLASHCARD'
        }
      },
      select: {
        id: true,
        questionContent: true,
        questionOptions: true,
        questionAnswerNotes: true,
      }
    });

    console.log(`Found ${questions.length} questions to check`);

    const progressBar = new cliProgress.SingleBar({
      format: 'Progress |{bar}| {percentage}% || {value}/{total} Questions',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
    });

    progressBar.start(questions.length, 0);

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE);
      await processBatch(batch, progressBar, matchingQuestions);
    }

    progressBar.stop();

    // Write results to a file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = `./matching-questions-${timestamp}.json`;
    
    fs.writeFileSync(
      resultsPath,
      JSON.stringify({
        totalQuestions: questions.length,
        matchingQuestionsCount: matchingQuestions.size,
        matchingQuestions: Array.from(matchingQuestions)
      }, null, 2)
    );

    console.log('\nCheck complete:');
    console.log(`- Total questions processed: ${questions.length}`);
    console.log(`- Questions with matching options and notes: ${matchingQuestions.size}`);
    console.log(`- Results written to: ${resultsPath}`);

  } catch (error) {
    console.error('Error during check:', error);
  }
}

findMatchingQuestions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 