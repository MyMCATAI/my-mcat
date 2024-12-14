import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

function previewText(text: string, length = 100): string {
  if (!text) return '[empty]';
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

async function createCARsPassagesFromCSV(isDryRun = true) {
  const csvFilePath = path.join(process.cwd(), 'data', 'CARsContent.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ',',
    quote: '"',
    escape: '"'
  }, async (error, records) => {
    if (error) {
      console.error("Error parsing CSV:", error);
      return;
    }

    const processedTexts = new Set();
    let count = 0;

    for (const record of records) {
      try {
        if (!record.text || processedTexts.has(record.text)) {
          continue;
        }

        processedTexts.add(record.text);
        const difficulty = parseFloat(record['passage difficulty']) || 1;

        if (isDryRun) {
          console.log('\n--- Preview of passage to be created ---');
          console.log('Text:', previewText(record.text));
          console.log('Citation:', previewText(record.citation || ''));
          console.log('Title:', previewText(record.title || ''));
          console.log('Description:', previewText(record.description || ''));
          console.log('Difficulty:', difficulty);
          console.log('----------------------------------------\n');
        } else {
          const passage = await prisma.passage.create({
            data: {
              text: record.text,
              citation: record.citation || '',
              title: record.title || null,
              description: record.description || null,
              difficulty: difficulty,
            },
          });
          console.log(`Created passage with ID: ${passage.id}`);
        }
      } catch (error) {
        console.error(`Error with passage:`, error);
      }
    }

    await prisma.$disconnect();
    const message = isDryRun 
      ? `Preview complete. ${processedTexts.size} passages would be created.`
      : `Finished creating passages. Total created: ${processedTexts.size}`;
    console.log(message);
  });
}

// First run in dry-run mode (true)
console.log("Starting dry run...");
createCARsPassagesFromCSV(false)
  .catch(console.error)
  .then(() => {
    console.log("\nDry run complete. To actually create the passages, run this script with isDryRun = false");
  }); 