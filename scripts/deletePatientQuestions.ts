import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function deletePatientQuestions(dryRun: boolean = true) {
  try {
    // Find all questions and their relations where types = 'patient'
    const questionsToDelete = await prisma.question.findMany({
      where: {
        types: 'patient'
      },
      include: {
        _count: {
          select: {
            testQuestions: true,
            userResponses: true
          }
        }
      }
    });

    if (questionsToDelete.length === 0) {
      console.log('\nNo patient questions found');
      return;
    }

    // Calculate totals
    const totalTestQuestions = questionsToDelete.reduce((sum, q) => sum + q._count.testQuestions, 0);
    const totalUserResponses = questionsToDelete.reduce((sum, q) => sum + q._count.userResponses, 0);

    // Summary before deletion
    console.log(`\nFound ${questionsToDelete.length} patient questions to delete`);
    console.log(`\nRelated records that will be cascade deleted:`);
    console.log(`- ${totalTestQuestions} test questions`);
    console.log(`- ${totalUserResponses} user responses`);

    if (dryRun) {
      console.log(`\n*** DRY RUN - No questions were deleted ***`);
      console.log(`Run with dryRun=false to perform deletion`);
    } else {
      // Perform the deletion (will cascade to TestQuestion and UserResponse)
      const result = await prisma.question.deleteMany({
        where: {
          types: 'patient'
        }
      });
      
      console.log(`\n*** DELETED ${result.count} patient questions and all related records ***`);
    }

    // List first 5 questions that would be/were affected
    console.log(`\nSample of affected questions:`);
    questionsToDelete.slice(0, 5).forEach(q => {
      console.log(`- ${q.questionID} with ${q._count.testQuestions} test questions and ${q._count.userResponses} responses`);
    });

  } catch (error) {
    console.error(`Error deleting patient questions:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get dry run flag from command line argument
const dryRun = process.argv[2] !== "false";

// Default to dry run for safety
deletePatientQuestions(dryRun).catch(console.error); 