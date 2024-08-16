import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function updateContentFromCSV() {
  const csvFilePath = path.join(process.cwd(), 'data', 'contentTranscripts.csv');
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
        // Find matching content based on title and link
        const existingContent = await prisma.content.findFirst({
          where: {
            AND: [
              { title: record.Title },
              { link: record.link }
            ]
          }
        });

        if (!existingContent) {
          console.log(`No matching content found for: ${record.Title}`);
          continue;
        }

        // Update the content with transcript and summary
        const updatedContent = await prisma.content.update({
          where: { id: existingContent.id },
          data: {
            transcript: record.transcript || null,
            summary: record.summary || null,
          },
        });

        console.log(`Updated content: ${updatedContent.title}`);
      } catch (error) {
        console.error(`Error updating content:`, error);
      }
    }

    await prisma.$disconnect();
    console.log("Finished updating content.");
  });
}

updateContentFromCSV().catch(console.error);