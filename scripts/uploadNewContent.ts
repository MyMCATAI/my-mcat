import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function uploadNewContentFromCSV(testMode = false) {
  const csvFilePath = path.join(process.cwd(), 'data', 'contentdec3.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  // Fetch all categories once
  const categories = await prisma.category.findMany();

  const missingCategories: string[] = [];
  let updatedCount = 0;
  let createdCount = 0;

  parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }, async (error, records) => {
    if (error) {
      console.error("Error parsing CSV:", error);
      return;
    }

    const recordsToProcess = records;

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

        // Check if content already exists by both title and categoryId
        const existingContent = await prisma.content.findFirst({
          where: { 
            AND: [
              { title: record.Title },
              { categoryId: category.id }
            ]
          }
        });

        const contentData = {
          title: record.Title,
          categoryId: category.id,
          link: record.link || "",
          audioLink: record.audioLink || "",
          type: record.type || "",
          total_timing: record.total_timing ? parseFloat(record.total_timing) : 0,
          minutes_estimate: record.minutes_estimate ? parseFloat(record.minutes_estimate) : 0,
          transcript: fullTranscript || null,
          summary: record.summary || null,
        };

        if (testMode) {
          const truncatedData = {
            ...contentData,
            transcript: contentData.transcript ? `${contentData.transcript.slice(0, 50)}...` : null,
            summary: contentData.summary ? `${contentData.summary.slice(0, 50)}...` : null
          };
          
          if (existingContent) {
            updatedCount++;
            console.log(`Would update content: ${record.Title} (Category: ${category.conceptCategory})`);
            console.log('Changes:', JSON.stringify(truncatedData, null, 2));
          } else {
            createdCount++;
            console.log(`Would create new content: ${record.Title} (Category: ${category.conceptCategory})`);
            console.log('Data:', JSON.stringify(truncatedData, null, 2));
          }
          continue;
        }

        if (existingContent) {
          const content = await prisma.content.update({
            where: { id: existingContent.id },
            data: contentData,
          });
          updatedCount++;
          console.log(`Updated content: ${content.title}`);
        } else {
          const content = await prisma.content.create({
            data: contentData,
          });
          createdCount++;
          console.log(`Created content: ${content.title}`);
        }
      } catch (error) {
        console.error(`Error creating content:`, error);
      }
    }

    await prisma.$disconnect();
    console.log(`\nFinished processing content:`);
    console.log(`- Total records processed: ${recordsToProcess.length}`);
    console.log(`- Records updated: ${updatedCount}`);
    console.log(`- Records created: ${createdCount}`);
    
    if (missingCategories.length > 0) {
      console.log('\nRecords with missing categories:');
      missingCategories.forEach(title => console.log(`- ${title}`));
    } else {
      console.log('\nAll records had matching categories.');
    }
  });
}

uploadNewContentFromCSV().catch(console.error);
