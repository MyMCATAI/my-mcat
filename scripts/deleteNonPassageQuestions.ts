// scripts/deleteNonPassageQuestions.ts
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function dryRunDeleteNonPassageQuestions() {
  try {
    // Count questions without passageId
    const questionsToDelete = await prisma.question.count({
      where: {
        passageId: null
      }
    });

    // Count questions with passageId
    const questionsToKeep = await prisma.question.count({
      where: {
        NOT: {
          passageId: null
        }
      }
    });

    console.log(`Questions to be deleted: ${questionsToDelete}`);
    console.log(`Questions to be kept: ${questionsToKeep}`);

    // Sample 5 questions to be deleted
    const sampleToDelete = await prisma.question.findMany({
      where: {
        passageId: null
      },
      take: 5,
      select: {
        id: true,
        questionContent: true
      }
    });

    console.log('\n5 sample questions to be deleted:');
    sampleToDelete.forEach(q => console.log(`ID: ${q.id}, Content: ${q.questionContent.substring(0, 50)}...`));

    // Sample 5 questions to be kept
    const sampleToKeep = await prisma.question.findMany({
      where: {
        NOT: {
          passageId: null
        }
      },
      take: 5,
      select: {
        id: true,
        questionContent: true,
        passageId: true
      }
    });

    console.log('\n5 sample questions to be kept:');
    sampleToKeep.forEach(q => console.log(`ID: ${q.id}, PassageID: ${q.passageId}, Content: ${q.questionContent.substring(0, 50)}...`));

  } catch (error) {
    console.error('Error during dry run:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function deleteNonPassageQuestions() {
  try {
    // Dry run code (counting and sampling) remains the same
    dryRunDeleteNonPassageQuestions();

    // Perform the actual deletion
    const deleteResult = await prisma.question.deleteMany({
      where: {
        passageId: null
      }
    });

    console.log(`\nDeletion complete. ${deleteResult.count} questions without a passageId have been deleted.`);

  } catch (error) {
    console.error('Error during question deletion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteNonPassageQuestions().catch(console.error);
