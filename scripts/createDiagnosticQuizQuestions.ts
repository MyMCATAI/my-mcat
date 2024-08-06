import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient, Category } from '@prisma/client';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

function stringCompare(a: string, b: string): boolean {
  return a.toLowerCase().trim() === b.toLowerCase().trim();
}

async function createQuestionsFromCSV() {
  const csvFilePath = path.join(process.cwd(), 'data', 'diagnostic.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  // Fetch all categories once
  const categories = await prisma.category.findMany();
  
  console.log("Available categories in the database:");
  categories.forEach(cat => console.log(`- "${cat.conceptCategory}" (${cat.conceptCategory.length} characters)`));

  parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }, async (error, records: any[]) => {
    if (error) {
      console.error("Error parsing CSV:", error);
      return;
    }

    for (const record of records) {
      try {
        if (!record.kc) {
          console.error("Error: 'kc' field is missing or undefined in the CSV record:");
          console.error(JSON.stringify(record, null, 2));
          continue;
        }

        console.log(`Processing question with kc: "${record.kc}" (${record.kc.length} characters)`);
        
        // Find the matching category
        const category = categories.find(cat => stringCompare(cat.conceptCategory, record.kc));

        if (!category) {
          console.error(`No matching category found for question: ${record.question}`);
          console.log("CSV kc value:", record.kc);
          console.log("Available categories:");
          categories.forEach(cat => {
            console.log(`- "${cat.conceptCategory}" (${cat.conceptCategory.length} characters)`);
          });
          continue;
        }

        // Create an array of options with the correct answer first
        const correctOption = record[record.correct];
        const options = [
          correctOption,
          ...['a', 'b', 'c', 'd', 'e']
            .map(key => record[key])
            .filter(option => option && option !== correctOption)
        ];

        const question = await prisma.question.create({
          data: {
            questionID: `diagnostic_${record.sc}_${record.xc}_${record.cc}_${record.kc}`,
            questionContent: record.question,
            questionOptions: JSON.stringify(options),
            questionAnswerNotes: '',
            contentCategory: record.kc,
            categoryId: category.id,
          },
        });
        console.log(`Created question: ${question.questionID}`);
      } catch (error) {
        console.error("Error creating question:");
        console.error("Record:", JSON.stringify(record, null, 2));
        console.error("Error:", error);
      }
    }

    await prisma.$disconnect();
    console.log("Finished creating questions.");
  });
}

createQuestionsFromCSV().catch(console.error);