// scripts/createTests.ts
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

function getFirstNWords(text: string, n: number): string {
  return text.split(/\s+/).slice(0, n).join(' ');
}

function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

async function createTestsFromPassages() {
  try {
    // Fetch all passages
    const passages = await prisma.passage.findMany({
      include: {
        questions: true
      }
    });

    console.log(`Found ${passages.length} passages`);

    for (const passage of passages) {
      if (passage.questions.length === 0) {
        console.log(`Skipping passage ${passage.id} as it has no questions`);
        continue;
      }

      const rawTitle = `${passage.id}: ${getFirstNWords(passage.text, 10)}...`;
      const testTitle = truncateString(rawTitle, 255);
      
        const test = await prisma.test.create({
          data: {
            title: testTitle,
            passageId: passage.id
          }
        });

      // If test creation succeeds, try updating with the description
      try {
        const updatedTest = await prisma.test.update({
          where: { id: test.id },
          data: { description: passage.text }
        });
        console.log(`Updated test ${updatedTest.id} with description`);
      } catch (error) {
        console.error("Error updating test with description:", error);
      }

      // Create test questions for each question associated with the passage
      for (let i = 0; i < passage.questions.length; i++) {
        const question = passage.questions[i];
        await prisma.testQuestion.create({
          data: {
            testId: test.id,
            questionId: question.id,
            sequence: i + 1
          }
        });
      }

      console.log(`Added ${passage.questions.length} questions to test ${test.id}`);
    }

    console.log("Finished creating tests.");
  } catch (error) {
    console.error("Error in main process:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestsFromPassages().catch(console.error);