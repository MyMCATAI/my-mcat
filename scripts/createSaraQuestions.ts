// scripts/createQuestions.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function createQuestionsFromCSV() {
  // Define the path to your CSV file
  const csvFilePath = path.join(process.cwd(), 'data', 'SARASWATI-Qs.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  // Fetch all categories once to avoid multiple database queries
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

        console.log(record['Kontent Category (K)']);
        console.log(record['Concept Category (C)']);
        const category = categories.find(cat => 
          cat.contentCategory === record['Kontent Category (K)'] &&
          cat.conceptCategory === record['Concept Category (C)']
        );

        if (!category) {
          console.error(`No matching category found for question ${record['Question ID']}`);
          continue;
        }

        // Create flashcard question
        await createQuestion(record, category.id, 'flashcard');

        // Create normal multiple choice question
        await createQuestion(record, category.id, 'normal');

        // Create patient multiple choice question
        await createQuestion(record, category.id, 'patient');

      } catch (error) {
        console.error(`Error creating questions:`, error);
      }
    }

    await prisma.$disconnect();
    console.log("Finished creating questions for the first 3 rows.");
  });
}

async function createQuestion(record: any, categoryId: string, type: 'flashcard' | 'normal' | 'patient') {
  // Determine question content based on type
  let questionContent, questionOptions, questionAnswerNotes, context;

  if (type === 'flashcard') {
    questionContent = record.Question;
    questionOptions = JSON.stringify([record.Answer]);
    questionAnswerNotes = JSON.stringify([record.Answer]);
  } else {
    const isNormal = type === 'normal';
    questionContent = isNormal ? record['MCQ Question'] : record['Patient Question'];
    questionOptions = JSON.stringify([record.Correct, record['Wrong 1'], record['Wrong 2'], record['Wrong 3']]);
    questionAnswerNotes = JSON.stringify([
      record['Correct Explanation'],
      record['Wrong 1 Explanation'],
      record['Wrong 2 Explanation'],
      record['Wrong 3 Explanation']
    ]);

    // Handle image placement
    const relevantImage = record['Relevant Image'];
    if (record.Image === '1') {
      questionContent += `\n\n${relevantImage}`;
    } else {
      context = relevantImage;
    }
  }
  const states = record.States ? JSON.stringify(record.States.split(',').map((s: string) => s.trim())) : null;

  // Create the question in the database
  const question = await prisma.question.create({
    data: {
      questionContent,
      questionOptions,
      questionAnswerNotes,
      context,
      categoryId,
      contentCategory: record['Kontent Category (K)'],
      questionID: `${record['Question ID']}-${type}`,
      difficulty: 1, // Default difficulty
      links: record.Link,
      tags: record.Topic,
      types: type,
      states,
    },

  });
  console.log(`Created ${type} question: ${question.questionID}`);
}

createQuestionsFromCSV().catch(console.error);
