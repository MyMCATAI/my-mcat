// scripts/createQuestions.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function createQuestionsFromCSV(dryRun: boolean = true) {
  const csvFilePath = path.join(process.cwd(), 'data', 'Nov24Questions.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  // Fetch all categories and existing questions' questionIDs
  const categories = await prisma.category.findMany();
  const existingQuestions = await prisma.question.findMany({
    select: { questionID: true, types: true }
  });

  // Create a map of existing questionIDs
  const existingQuestionMap = new Set(
    existingQuestions.map(q => q.questionID)
  );

  // Track missing categories
  const missingCategories = new Set<string>();

  parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }, async (error, records) => {
    if (error) {
      console.error("Error parsing CSV:", error);
      return;
    }

    let questionsToAdd = 0;
    let questionsSkipped = 0;

    for (const record of records) {
      try {
        const category = categories.find(cat => 
          cat.contentCategory === record['Kontent Category (K)'] &&
          cat.conceptCategory === record['Concept Category (C)']
        );

        if (!category) {
          const missingCategoryKey = `${record['Kontent Category (K)']} | ${record['Concept Category (C)']}`;
          missingCategories.add(missingCategoryKey);
          console.error(`No matching category found for question ${record['Question ID']}`);
          continue;
        }

        // Check each question type
        const types: Array<'flashcard' | 'normal' | 'patient'> = ['flashcard', 'normal', 'patient'];
        
        for (const type of types) {
          const questionId = `${record['Question ID']}-${type}`;
          
          if (existingQuestionMap.has(questionId)) {
            console.log(`Skipping existing question: ${questionId}`);
            questionsSkipped++;
            continue;
          }

          if (dryRun) {
            console.log(`Would create new ${type} question: ${questionId}`);
            questionsToAdd++;
          } else {
            await createQuestion(record, category.id, type);
            questionsToAdd++;
          }
        }

      } catch (error) {
        console.error(`Error processing question:`, error);
      }
    }

    await prisma.$disconnect();
    console.log(`\nSummary:`);
    console.log(`${questionsToAdd} questions would ${dryRun ? 'be' : 'were'} added`);
    console.log(`${questionsSkipped} questions skipped (already exist)`);
    
    if (missingCategories.size > 0) {
      console.log(`\nMissing Categories (${missingCategories.size}):`);
      console.log('Content Category | Concept Category');
      console.log('-'.repeat(50));
      missingCategories.forEach(category => console.log(category));
    }
    
    console.log(`\n${dryRun ? '*** This was a dry run ***' : '*** Questions were created in database ***'}`);
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
