// scripts/deletePassageContent.ts
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function deletePassageContent() {
  const passageIds = [
    'cm4nlctvi0000kdszt1z71ovs',
    'cm4nlcu380001kdszs8rujvsf',
    'cm4nlcu830002kdsz85iy75tx',
    'cm4nlcucy0003kdszokddoilg',
    'cm4nlcuho0004kdszbrtdzaad',
    'cm4nlcumn0005kdsz6j39qepw',
    'cm4nlcurd0006kdszsk4lfgx9'
  ];

  try {
    // First get all the tests for these passages
    const tests = await prisma.test.findMany({
      where: {
        passageId: {
          in: passageIds
        }
      },
      select: {
        id: true,
        title: true
      }
    });

    const testIds = tests.map(t => t.id);

    // 1. Delete TestQuestions first (foreign key relationships)
    const deletedTestQuestions = await prisma.testQuestion.deleteMany({
      where: {
        testId: {
          in: testIds
        }
      }
    });
    console.log(`Deleted ${deletedTestQuestions.count} test questions`);

    // 2. Delete Questions
    const deletedQuestions = await prisma.question.deleteMany({
      where: {
        passageId: {
          in: passageIds
        }
      }
    });
    console.log(`Deleted ${deletedQuestions.count} questions`);

    // 3. Finally delete Tests
    const deletedTests = await prisma.test.deleteMany({
      where: {
        passageId: {
          in: passageIds
        }
      }
    });
    console.log(`Deleted ${deletedTests.count} tests`);

    console.log('\nDeletion completed successfully');

  } catch (error) {
    console.error('Error during deletion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deletePassageContent().catch(console.error);