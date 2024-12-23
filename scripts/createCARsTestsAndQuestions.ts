import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

const DRY_RUN = false

interface CARsRecord {
  text: string;
  citation: string;
  title: string;
  description: string;
  'passage difficulty': string;
  question: string;
  options: string;
  'category (prisma)': string;
  explanation: string;
  'question difficulty': string;
  'answer notes': string;
  context: string;
  'passage title': string;
}

const parseOptions = (optionsStr: string): string[] => {
  try {
    return JSON.parse(optionsStr);
  } catch (e) {
    try {
      const cleaned = optionsStr
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/'/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
      return JSON.parse(cleaned);
    } catch (e) {
      if (optionsStr.includes('","')) {
        return optionsStr
          .replace(/^\[|\]$/g, '')
          .split('","')
          .map(opt => opt.replace(/^"|"$/g, '').trim());
      }
      console.error(`Could not parse options: ${optionsStr}`);
      return [];
    }
  }
};

async function createCARsTestsAndQuestions() {
  
  // Fetch existing data
  const passages = await prisma.passage.findMany();
  console.log(`Found ${passages.length} existing passages`);
  
  const categories = await prisma.category.findMany();
  console.log(`Found ${categories.length} existing categories`);
  
  const existingTests = await prisma.test.findMany({
    where: {
      passageId: { in: passages.map(p => p.id) }
    }
  });
  console.log(`Found ${existingTests.length} existing tests`);
  
  const existingQuestions = await prisma.question.findMany({
    where: {
      passageId: { in: passages.map(p => p.id) }
    }
  });
  console.log(`Found ${existingQuestions.length} existing questions`);
  
  const csvFilePath = path.join(process.cwd(), 'data', 'CARsContent.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  if (DRY_RUN) {
    console.log('🏃 DRY RUN MODE - No database changes will be made');
  }

  parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ',',
    quote: '"',
    escape: '"'
  }, async (error, records: CARsRecord[]) => {
    if (error) {
      console.error("Error parsing CSV:", error);
      return;
    }

    console.log(`Parsed ${records.length} records from CSV`);

    // Group records by passage title and test title
    const recordsByPassageAndTest = records.reduce((acc, record) => {
      if (!record['passage title'] || !record.title) return acc;
      
      const passageTitle = record['passage title'];
      const testTitle = record.title;
      
      if (!acc[passageTitle]) {
        acc[passageTitle] = {};
      }
      if (!acc[passageTitle][testTitle]) {
        acc[passageTitle][testTitle] = [];
      }
      acc[passageTitle][testTitle].push(record);
      return acc;
    }, {} as Record<string, Record<string, CARsRecord[]>>);

    console.log(`Grouped records into ${Object.keys(recordsByPassageAndTest).length} passages`);

    for (const [passageTitle, testGroups] of Object.entries(recordsByPassageAndTest)) {
      try {
        console.log(`\nProcessing passage: ${passageTitle}`);
        
        // Find matching passage
        const passage = passages.find(p => p.title === passageTitle);
        if (!passage) {
          console.log(`No matching passage found for: ${passageTitle}`);
          continue;
        }
        console.log(`Found matching passage: ${passage.id}`);

        // Process each test group
        for (const [testTitle, records] of Object.entries(testGroups)) {
          console.log(`\nProcessing test: ${testTitle}`);
          
          // If in test run mode, limit the records
          const recordsToProcess = records;
          
          // Find or create test
          const existingTest = existingTests.find(t => 
            t.passageId === passage.id && t.title === testTitle
          );

          let test;
          if (existingTest) {
            test = existingTest;
            console.log(`Using existing test: ${test.id}`);
          } else {
            if (DRY_RUN) {
              console.log(`Would create new test: ${testTitle}`);
            } else {
              test = await prisma.test.create({
                data: {
                  title: testTitle,
                  passageId: passage.id,
                  description: records[0].description || '',
                  difficulty: parseFloat(records[0]['passage difficulty']) || 1
                }
              });
            }
            console.log(`Created new test: ${test?.id}`);
          }

          // Process each question
          for (let i = 0; i < recordsToProcess.length; i++) {
            const record = recordsToProcess[i];
            console.log(`\nProcessing question ${i + 1}/${recordsToProcess.length}`);
            console.log(`Question content: ${record.question.substring(0, 100)}...`);
            
            // Find category
            const category = categories.find(c => c.conceptCategory === record['category (prisma)']);
            if (!category) {
              console.log(`No matching category found for: ${record['category (prisma)']}`);
              continue;
            }
            console.log(`Found matching category: ${category.conceptCategory}`);

            // Parse options
            const options = parseOptions(record.options);
            console.log(`Parsed ${options.length} options for question: ${JSON.stringify(options)}`);

            // Find existing question
            const existingQuestion = existingQuestions.find(q =>
              q.passageId === passage.id &&
              q.questionContent === record.question
            );

            let question = existingQuestion;
            
            if (!existingQuestion) {
              if (DRY_RUN) {
                console.log(`Would create new question: ${record.question}`);
              } else {
                question = await prisma.question.create({
                  data: {
                    questionContent: record.question,
                    questionOptions: JSON.stringify(options),
                    questionAnswerNotes: record.explanation,
                    context: record.context || '',
                    difficulty: parseFloat(record['question difficulty']) || 1,
                    passageId: passage.id,
                    categoryId: category.id,
                    contentCategory: category.contentCategory,
                    questionID: `CARS_${passage.id}_${testTitle}_${i + 1}`
                  }
                });
              }
              console.log(`Created new question: ${question?.id}`);
            } else {
              console.log(`Using existing question: ${existingQuestion.id}`);
            }

            // Create test question link if it doesn't exist
            if (question && test) {
              const existingTestQuestion = await prisma.testQuestion.findFirst({
                where: {
                  testId: test.id,
                  questionId: question.id
                }
              });

              if (!existingTestQuestion) {
                if (DRY_RUN) {
                  console.log(`Would create new test question link: ${test.id}_${question.id}`);
                } else {
                  const testQuestion = await prisma.testQuestion.create({
                    data: {
                      testId: test.id,
                      questionId: question.id,
                      sequence: i + 1
                    }
                  });
                  console.log(`Created new test question link: ${testQuestion.id}`);
                }
              } else {
                console.log(`Test question link already exists`);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing passage ${passageTitle}:`, error);
      }
    }

    await prisma.$disconnect();
    console.log("\nFinished processing tests, questions, and links.");
  });
}

createCARsTestsAndQuestions().catch(console.error); 