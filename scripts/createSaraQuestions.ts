// scripts/createQuestions.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

// Add this helper function
function sanitizeText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/andnbsp;/g, ' ');  // Handle malformed &nbsp;
}

async function createQuestionsFromCSV(dryRun: boolean = true, contentCategory?: string, limit: number = 3) {
  const csvFilePath = path.join(process.cwd(), 'data', 'Dec3Questions.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  // Fetch all categories and existing questions
  const categories = await prisma.category.findMany();
  const existingQuestions = await prisma.question.findMany();

  // Create a map of existing questionIDs with full question data
  const existingQuestionMap = new Map(
    existingQuestions.map(q => [q.questionID, q])
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

    let questionsProcessed = 0;
    let questionsToUpdate = 0;
    let questionsToCreate = 0;
    let questionsFiltered = 0;

    for (const record of records) {
      try {
        // Check if we've hit the limit
        if (questionsProcessed >= limit) {
          console.log(`\nReached limit of ${limit} questions`);
          break;
        }

        // Skip if content category doesn't match filter
        if (contentCategory && record['Kontent Category (K)'] !== contentCategory) {
          questionsFiltered++;
          continue;
        }

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
          const existingQuestion = existingQuestionMap.get(questionId);
          
          if (dryRun) {
            if (existingQuestion) {
              console.log(`Would update existing ${type} question: ${questionId}`);
              questionsToUpdate++;
            } else {
              console.log(`Would create new ${type} question: ${questionId}`);
              questionsToCreate++;
            }
          } else {
            if (existingQuestion) {
              await updateQuestion(record, category.id, type, existingQuestion.id);
              questionsToUpdate++;
            } else {
              await createQuestion(record, category.id, type);
              questionsToCreate++;
            }
          }
          questionsProcessed++;
        }

      } catch (error) {
        console.error(`Error processing question:`, error);
      }
    }

    await prisma.$disconnect();
    console.log(`\nSummary:`);
    if (contentCategory) {
      console.log(`Filtering for content category: ${contentCategory}`);
      console.log(`${questionsFiltered} questions filtered out`);
    }
    console.log(`Questions processed: ${questionsProcessed}`);
    console.log(`Questions to ${dryRun ? 'be updated' : 'updated'}: ${questionsToUpdate}`);
    console.log(`Questions to ${dryRun ? 'be created' : 'created'}: ${questionsToCreate}`);
    
    if (missingCategories.size > 0) {
      console.log(`\nMissing Categories (${missingCategories.size}):`);
      console.log('Content Category | Concept Category');
      console.log('-'.repeat(50));
      missingCategories.forEach(category => console.log(category));
    }
    
    console.log(`\n${dryRun ? '*** This was a dry run ***' : '*** Changes were made to database ***'}`);
  });
}

async function createQuestion(record: any, categoryId: string, type: 'flashcard' | 'normal' | 'patient') {
  let questionContent, questionOptions, questionAnswerNotes, context;

  if (type === 'flashcard') {
    questionContent = sanitizeText(record.Question);
    questionOptions = JSON.stringify([sanitizeText(record.Answer)]);
    questionAnswerNotes = JSON.stringify([sanitizeText(record.Answer)]);
  } else {
    const isNormal = type === 'normal';
    questionContent = sanitizeText(isNormal ? record['MCQ Question'] : record['Patient Question']);
    questionOptions = JSON.stringify([
      sanitizeText(record.Correct),
      sanitizeText(record['Wrong 1']),
      sanitizeText(record['Wrong 2']),
      sanitizeText(record['Wrong 3'])
    ]);
    questionAnswerNotes = JSON.stringify([
      sanitizeText(record['Correct Explanation']),
      sanitizeText(record['Wrong 1 Explanation']),
      sanitizeText(record['Wrong 2 Explanation']),
      sanitizeText(record['Wrong 3 Explanation'])
    ]);

    const relevantImage = sanitizeText(record['Relevant Image']);
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
      difficulty: 1,
      links: sanitizeText(record.Link),
      tags: sanitizeText(record.Topic),
      types: type,
      states,
    },
  });
  console.log(`Created ${type} question: ${question.questionID}`);
}

async function testQuestionsFromCSV(contentCategory?: string) {
  const csvFilePath = path.join(process.cwd(), 'data', 'Dec3Questions.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  // Fetch all existing questions and categories
  const existingQuestions = await prisma.question.findMany();
  const categories = await prisma.category.findMany();
  
  // Create maps for faster lookups
  const existingQuestionMap = new Map(
    existingQuestions.map(q => [q.questionID, q])
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

    let totalQuestions = 0;
    let matchedQuestions = 0;
    let mismatchedQuestions = 0;

    for (const record of records) {
      if (contentCategory && record['Kontent Category (K)'] !== contentCategory) {
        continue;
      }

      // Check if category exists
      const category = categories.find(cat => 
        cat.contentCategory === record['Kontent Category (K)'] &&
        cat.conceptCategory === record['Concept Category (C)']
      );

      if (!category) {
        const missingCategoryKey = `${record['Kontent Category (K)']} | ${record['Concept Category (C)']}`;
        missingCategories.add(missingCategoryKey);
      }

      const types: Array<'flashcard' | 'normal' | 'patient'> = ['flashcard', 'normal', 'patient'];
      
      for (const type of types) {
        totalQuestions++;
        const questionId = `${record['Question ID']}-${type}`;
        const existingQuestion = existingQuestionMap.get(questionId);

        if (existingQuestion) {
          matchedQuestions++;
          console.log(`\nFound question: ${questionId}`);
          console.log(`Content Category: ${existingQuestion.contentCategory}`);
          console.log(`Question Type: ${existingQuestion.types}`);
          console.log(`Question Content: ${existingQuestion.questionContent?.substring(0, 100)}...`);
        } else {
          mismatchedQuestions++;
          console.log(`\nMissing question: ${questionId}`);
        }
      }
    }

    await prisma.$disconnect();
    console.log(`\nTest Summary:`);
    console.log(`Total questions processed: ${totalQuestions}`);
    console.log(`Matched questions: ${matchedQuestions}`);
    console.log(`Missing questions: ${mismatchedQuestions}`);
    
    if (missingCategories.size > 0) {
      console.log(`\nMissing Categories (${missingCategories.size}):`);
      console.log('Content Category | Concept Category');
      console.log('-'.repeat(50));
      missingCategories.forEach(category => console.log(category));
    }
  });
}

async function updateQuestion(record: any, categoryId: string, type: 'flashcard' | 'normal' | 'patient', questionId: string) {
  let questionContent, questionOptions, questionAnswerNotes, context;

  if (type === 'flashcard') {
    questionContent = sanitizeText(record.Question);
    questionOptions = JSON.stringify([sanitizeText(record.Answer)]);
    questionAnswerNotes = JSON.stringify([sanitizeText(record.Answer)]);
  } else {
    const isNormal = type === 'normal';
    questionContent = sanitizeText(isNormal ? record['MCQ Question'] : record['Patient Question']);
    questionOptions = JSON.stringify([
      sanitizeText(record.Correct),
      sanitizeText(record['Wrong 1']),
      sanitizeText(record['Wrong 2']),
      sanitizeText(record['Wrong 3'])
    ]);
    questionAnswerNotes = JSON.stringify([
      sanitizeText(record['Correct Explanation']),
      sanitizeText(record['Wrong 1 Explanation']),
      sanitizeText(record['Wrong 2 Explanation']),
      sanitizeText(record['Wrong 3 Explanation'])
    ]);

    const relevantImage = sanitizeText(record['Relevant Image']);
    if (record.Image === '1') {
      questionContent += `\n\n${relevantImage}`;
    } else {
      context = relevantImage;
    }
  }
  const states = record.States ? JSON.stringify(record.States.split(',').map((s: string) => s.trim())) : null;

  const question = await prisma.question.update({
    where: { id: questionId },
    data: {
      questionContent,
      questionOptions,
      questionAnswerNotes,
      context,
      categoryId,
      contentCategory: record['Kontent Category (K)'],
      links: sanitizeText(record.Link),
      tags: sanitizeText(record.Topic),
      types: type,
      states,
    },
  });
  console.log(`Updated ${type} question: ${question.questionID}`);
}

// Update the script execution
const contentCategory = process.argv[2];
const dryRun = process.argv[3] !== 'false';  // default to true unless explicitly set to false
const testMode = process.argv[4] === 'test';
const limit = process.argv[5] ? parseInt(process.argv[5]) : 3;  // default to 3 if not specified

if (testMode) {
  testQuestionsFromCSV(contentCategory).catch(console.error);
} else {
  createQuestionsFromCSV(dryRun, contentCategory, limit).catch(console.error);
}
