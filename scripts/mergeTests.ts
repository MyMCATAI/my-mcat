// scripts/mergeTests.ts
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function mergeTestsBySetName() {
  try {
    // Get all unique setNames
    const uniqueSets = await prisma.test.findMany({
      select: {
        setName: true,
      },
      distinct: ['setName'],
      where: {
        setName: {
          not: null,
        },
      },
    });

    console.log(`Found ${uniqueSets.length} unique sets`);

    for (const set of uniqueSets) {
      const setName = set.setName;
      if (!setName) continue;

      // Get all tests for this set
      const testsInSet = await prisma.test.findMany({
        where: { setName: setName },
        include: { questions: true },
      });

      console.log(`Processing set: ${setName} with ${testsInSet.length} tests`);

      if (testsInSet.length <= 1) {
        console.log(`Skipping set ${setName} as it has 1 or fewer tests`);
        continue;
      }

      // Combine titles for the description
      const combinedDescription = testsInSet.map(test => test.title).join(' | ');

      // Create a new merged test
      const mergedTest = await prisma.test.create({
        data: {
          title: setName,
          description: combinedDescription,
          setName: setName,
        },
      });

      console.log(`Created merged test: ${mergedTest.id}`);

      // Combine questions from all tests in the set
      let sequence = 1;
      for (const test of testsInSet) {
        for (const question of test.questions) {
          await prisma.testQuestion.create({
            data: {
              testId: mergedTest.id,
              questionId: question.questionId,
              sequence: sequence++,
            },
          });
        }
      }

      console.log(`Added ${sequence - 1} questions to merged test ${mergedTest.id}`);

      // Delete the TestQuestion entries and then the original tests
      for (const test of testsInSet) {
        // Delete associated TestQuestion entries
        await prisma.testQuestion.deleteMany({
          where: { testId: test.id },
        });

        // Now it's safe to delete the test
        await prisma.test.delete({
          where: { id: test.id },
        });
      }

      console.log(`Deleted ${testsInSet.length} original tests and their questions`);
    }

    console.log("Finished merging tests.");
  } catch (error) {
    console.error("Error in merging process:", error);
  } finally {
    await prisma.$disconnect();
  }
}

mergeTestsBySetName().catch(console.error);