import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function createContentFromCSV() {
  const csvFilePath = path.join(process.cwd(), 'data', 'content.csv');
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
          cat.conceptCategory === record.conceptCategory
        );

        if (!category) {
          console.error(`No matching category found for content: ${record.Title}`);
          continue;
        }

        const content = await prisma.content.create({
          data: {
            title: record.Title,
            categoryId: category.id,
            link: record.link,
            type: record.type,
            total_timing: record['total timing'] ? parseFloat(record['total timing']) : 0,
            minutes_estimate: record.minutes_estimate ? parseFloat(record.minutes_estimate) : 0,
            transcript: record.transcript || null,
          },
        });
        console.log(`Created content: ${content.title}`);
      } catch (error) {
        console.error(`Error creating content:`, error);
      }
    }

    await prisma.$disconnect();
    console.log("Finished creating content.");
  });
}

createContentFromCSV().catch(console.error);