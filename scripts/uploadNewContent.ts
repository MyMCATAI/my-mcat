import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function uploadNewContentFromCSV(testMode = false) {
  const csvFilePath = path.join(process.cwd(), 'data', 'Video and Links - Content Table.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  // Fetch all categories once
  const categories = await prisma.category.findMany();

  const missingCategories: string[] = [];

  parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }, async (error, records) => {
    if (error) {
      console.error("Error parsing CSV:", error);
      return;
    }

    const recordsToProcess = testMode ? records.slice(0, 3) : records;

    for (const record of recordsToProcess) {
      try {
        // Find the matching category
        const category = categories.find(cat => 
          cat.conceptCategory === record.conceptCategory
        );

        if (!category) {
          console.error(`No matching category found for content: ${record.Title}`);
          missingCategories.push(record.Title);
          continue;
        }

        // Combine transcript parts
        const fullTranscript = [
          record.Transcript,
          record['Transcript pt. 2'],
          record['Transcript pt. 3']
        ].filter(Boolean).join('\n\n');

        const content = await prisma.content.create({
          data: {
            title: record.Title,
            categoryId: category.id,
            link: record.link || "",
            audioLink: record.audioLink || "",
            type: record.type || "",
            total_timing: record.total_timing ? parseFloat(record.total_timing) : 0,
            minutes_estimate: record.minutes_estimate ? parseFloat(record.minutes_estimate) : 0,
            transcript: fullTranscript || null,
            summary: record.summary || null,
          },
        });
        console.log(`Created content: ${content.title}`);
      } catch (error) {
        console.error(`Error creating content:`, error);
      }
    }

    await prisma.$disconnect();
    console.log(`Finished creating content. Processed ${recordsToProcess.length} records.`);
    
    if (missingCategories.length > 0) {
      console.log('\nRecords with missing categories:');
      missingCategories.forEach(title => console.log(`- ${title}`));
    } else {
      console.log('\nAll records had matching categories.');
    }
  });
}

uploadNewContentFromCSV().catch(console.error);
