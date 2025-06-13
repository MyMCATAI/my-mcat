import prismadb from '../lib/prismadb';
import fs from 'fs';
import path from 'path';

async function scrapeData() {
  try {
    const data: { [key: string]: any[] } = {};

    // List of all models from your schema.prisma
    const models = [
      'UserInfo',
      'UserSubscription',
      'Passage',
      'Question',
      'Category',
      'Test',
      'TestQuestion',
      'UserTest',
      'UserResponse',
      'StudyPlan',
      'CalendarActivity',
      'Content',
      'KnowledgeProfile',
      'Review',
      'PatientRecord',
      'Referral',
      'DataPulse',
      'FullLengthExam',
      'UserActivity',
      'Notification',
    ];

    for (const modelName of models) {
      console.log(`Scraping data from ${modelName}...`);
      let allRecords: any[] = [];
      let skip = 0;
      const take = 50000; // PlanetScale limit is 100,000, so fetch in smaller batches

      while (true) {
        // @ts-ignore - Prisma client methods are dynamically accessible
        const records = await prismadb[modelName].findMany({
          take: take,
          skip: skip,
        });

        if (records.length === 0) {
          break; // No more records to fetch
        }

        allRecords = allRecords.concat(records);
        skip += records.length;

        if (records.length < take) {
          break; // Last batch was smaller than take, so we've fetched all records
        }
      }
      data[modelName] = allRecords;
      console.log(`Scraped ${allRecords.length} records from ${modelName}`);
    }

    const outputDir = path.join(process.cwd(), 'scraped_data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputFile = path.join(outputDir, `planetscale_data_${Date.now()}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`All data scraped and saved to ${outputFile}`);

  } catch (error) {
    console.error('Error scraping data:', error);
  } finally {
    await prismadb.$disconnect();
  }
}

scrapeData(); 