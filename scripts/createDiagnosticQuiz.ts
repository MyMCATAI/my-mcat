import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// need to create quiz questions first
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function createDiagnosticTest() {
  try {
    // Create a new Test
    const newTest = await prisma.test.create({
      data: {
        title: "Diagnostic Test",
        description: "A comprehensive diagnostic test to assess your current knowledge.",
        setName: "Diagnostic",
      },
    });

    console.log(`Created new test: ${newTest.id}`);

    // Fetch all questions with IDs starting with 'diagnostic'
    const diagnosticQuestions = await prisma.question.findMany({
      where: {
        questionID: {
          startsWith: 'diagnostic'
        }
      },
      select: {
        id: true,
        questionID: true
      }
    });

    console.log(`Found ${diagnosticQuestions.length} diagnostic questions`);

    // Create TestQuestions for each diagnostic question
    const testQuestions = await Promise.all(diagnosticQuestions.map((question, index) => 
      prisma.testQuestion.create({
        data: {
          testId: newTest.id,
          questionId: question.id,
          sequence: index + 1  // Use the index to set the sequence
        }
      })
    ));

    console.log(`Created ${testQuestions.length} TestQuestions`);

    // Fetch the created test with its questions to verify
    const createdTest = await prisma.test.findUnique({
      where: { id: newTest.id },
      include: {
        questions: {
          include: {
            question: true
          }
        }
      }
    });

    console.log('Created Diagnostic Test:');
    console.log(JSON.stringify(createdTest, null, 2));

  } catch (error) {
    console.error('Error creating diagnostic test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDiagnosticTest().catch(console.error);