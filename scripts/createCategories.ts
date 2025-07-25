// scripts/createCategories.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function createCategoriesFromCSV() {
  const csvFilePath = path.join(process.cwd(), 'data', 'passageQuestions.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }, async (error, records) => {
    if (error) {
      console.error("Error parsing CSV:", error);
      return;
    }

    const uniqueCategories = new Set();

    for (const record of records) {
      const categoryKey = `${record['Subject Category']}-${record.KC}-${record['Concept Category']}`;
      
      if (!uniqueCategories.has(categoryKey)) {
        uniqueCategories.add(categoryKey);
        
        try {
          const category = await prisma.category.create({
            data: {
              section: record.Section,
              subjectCategory: record['Subject Category'],
              contentCategory: record.KC,
              conceptCategory: record['Concept Category'],
              generalWeight: parseFloat(record['General Weight']),
            },
          });
          console.log(`Created category: ${category.subjectCategory} - ${category.contentCategory} - ${category.conceptCategory}`);
        } catch (error) {
          console.error(`Error creating category:`, error);
        }
      }
    }

    await prisma.$disconnect();
    console.log("Finished creating categories.");
  });
}

createCategoriesFromCSV().catch(console.error);