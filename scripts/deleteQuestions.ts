import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function deleteQuestionsByCategory(contentCategory: string, dryRun: boolean = true) {
  try {
    // Find all questions and their relations matching the content category
    const questionsToDelete = await prisma.question.findMany({
      where: {
        contentCategory: contentCategory
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
      console.log(`\nNo questions found with content category: ${contentCategory}`);
      return;
    }

    // Calculate totals
    const totalTestQuestions = questionsToDelete.reduce((sum, q) => sum + q._count.testQuestions, 0);
    const totalUserResponses = questionsToDelete.reduce((sum, q) => sum + q._count.userResponses, 0);

    // Group questions by type for better reporting
    const questionsByType = questionsToDelete.reduce((acc, q) => {
      acc[q.types || "normal"] = (acc[q.types || "normal"] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Summary before deletion
    console.log(`\nFound ${questionsToDelete.length} questions to delete:`);
    Object.entries(questionsByType).forEach(([type, count]) => {
      console.log(`- ${count} ${type} questions`);
    });
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
          contentCategory: contentCategory
        }
      });
      
      console.log(`\n*** DELETED ${result.count} questions and all related records ***`);
    }

    // List first 5 questions that would be/were affected
    console.log(`\nSample of affected questions:`);
    questionsToDelete.slice(0, 5).forEach(q => {
      console.log(`- ${q.questionID} (${q.types || "normal"}) with ${q._count.testQuestions} test questions and ${q._count.userResponses} responses`);
    });

  } catch (error) {
    console.error(`Error deleting questions:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get content category from command line argument
const contentCategory = process.argv[2];
const dryRun = process.argv[3] !== "false";

if (!contentCategory) {
  console.error(`Please provide a content category to delete.`);
  console.error(`Usage: npm run ts-node scripts/deleteQuestions.ts "1A" [false]`);
  process.exit(1);
}

// Default to dry run for safety
deleteQuestionsByCategory(contentCategory, dryRun).catch(console.error);