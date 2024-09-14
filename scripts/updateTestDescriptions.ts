// scripts/removeQuotationMarks.ts
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function removeQuotationMarksFromDescriptions() {
  try {
    // Fetch all tests
    const tests = await prisma.test.findMany();

    console.log(`Found ${tests.length} tests`);

    // Define the quotation marks to remove
    const quotationMarks = `"'“”‘’`;

    // Create a regex to match quotation marks at the start or end
    const regex = new RegExp(`^[${quotationMarks}]+|[${quotationMarks}]+$`, 'g');

    let updatedCount = 0;

    for (const test of tests) {
      const { id, description } = test;

      if (!description) continue;

      // Remove quotation marks at the start and end
      const updatedDescription = description.replace(regex, '');

      if (description !== updatedDescription) {
        // Update the test's description
        await prisma.test.update({
          where: { id },
          data: { description: updatedDescription },
        });
        updatedCount++;
        console.log(`Updated test id ${id}`);
      }
    }

    console.log(`Finished updating ${updatedCount} test descriptions.`);
  } catch (error) {
    console.error('Error updating test descriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeQuotationMarksFromDescriptions().catch(console.error);
