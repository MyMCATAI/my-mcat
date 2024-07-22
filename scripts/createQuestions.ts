// scripts/createQuestions.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function createQuestionsFromCSV() {
  const csvFilePath = path.join(process.cwd(), 'data', 'questions.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  // Fetch all categories once
  const categories = await prisma.category.findMany();

  parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }, async (error, records) => {
    if (error) {
      console.error("Error parsing CSV:", error);
      return;
    }

    for (const record of records) {
      try {
        // Find the matching category
        const category = categories.find(cat => 
          cat.contentCategory === record['Content Category'] &&
          cat.conceptCategory === record['Concept Category (CC)']
        );

        if (!category) {
          console.error(`No matching category found for question ${record['Question ID']}`);
          continue;
        }

        // Combine correct and wrong answers into a single array
        const questionOptions = [
          record['Correct'],
          record['Wrong 1'],
          record['Wrong 2'],
          record['Wrong 3']
        ].filter(Boolean); // Remove any empty answers

        const question = await prisma.question.create({
          data: {
            questionID: record['Question ID'],
            questionContent: record['Question'],
            questionOptions: questionOptions,
            questionAnswerNotes: record['Keywords?'] || undefined,
            contentCategory: record['Content Category'],
            categoryId: category.id,
            // Add passageId if it's in your CSV. If not, it will be null by default.
          },
        });
        console.log(`Created question: ${question.questionID}`);
      } catch (error) {
        console.error(`Error creating question:`, error);
      }
    }

    await prisma.$disconnect();
    console.log("Finished creating questions.");
  });
}

createQuestionsFromCSV().catch(console.error);