// scripts/createQuestions.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function createQuestionsFromCSV() {
  const csvFilePath = path.join(process.cwd(), 'data', 'passageQuestions.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  // Fetch all categories and passages once
  const categories = await prisma.category.findMany();
  const passages = await prisma.passage.findMany();

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
          cat.contentCategory === record.KC &&
          cat.conceptCategory === record['Concept Category']
        );

        if (!category) {
          console.error(`No matching category found for question ${record['Question ID']}`);
          continue;
        }

        // Find the matching passage
        const passage = passages.find(p => p.id === record.PassageID);

        if (!passage) {
          console.error(`No matching passage found for question ${record['Question ID']}`);
          continue;
        }

        // Create an array of options with the correct answer first
        const options = [record[record.correct], record.a, record.b, record.c, record.d];
        const uniqueOptions = options
          .filter((option, index, self) => 
            option && self.indexOf(option) === index
          );

        const question = await prisma.question.create({
          data: {
            questionID: record['Question ID'],
            questionContent: record.Question,
            questionOptions: JSON.stringify(uniqueOptions),
            questionAnswerNotes: '',
            contentCategory: record.KC,
            passageId: passage.id,
            categoryId: category.id,
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