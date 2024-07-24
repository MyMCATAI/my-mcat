// scripts/createPassages.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function createPassagesFromCSV() {
  const csvFilePath = path.join(process.cwd(), 'data', 'passages.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

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
        const passage = await prisma.passage.create({
          data: {
            id: record['PassageID'],
            text: record['Passage Text'],
            citation: record['Citation'],
          },
        });
        console.log(`Created passage with ID: ${passage.id}`);
      } catch (error) {
        console.error(`Error creating passage:`, error);
      }
    }

    await prisma.$disconnect();
    console.log("Finished creating passages.");
  });
}

createPassagesFromCSV().catch(console.error);