import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

const OLD_CATEGORY_ID = 'clywfv2g2001311jwh5b1j28w';
const NEW_CATEGORY_ID = 'clywfv2cd001211jwv9uiaxli';

async function updateQuestionCategories(dryRun: boolean = true) {
  try {
    // Count affected records
    const affectedCount = await prisma.question.count({
      where: {
        categoryId: OLD_CATEGORY_ID
      }
    });

    console.log(`Number of questions to be updated: ${affectedCount}`);

    if (dryRun) {
      console.log('Dry run completed. No changes were made.');
      return;
    }

    // Perform the update
    const updateResult = await prisma.question.updateMany({
      where: {
        categoryId: OLD_CATEGORY_ID
      },
      data: {
        categoryId: NEW_CATEGORY_ID
      }
    });

    console.log(`Updated ${updateResult.count} questions.`);

  } catch (error) {
    console.error('Error updating question categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run with dry run by default
updateQuestionCategories(false)
  .then(() => console.log('Script completed.'))
  .catch(console.error);

// To run the actual update, call the function with false as the argument
// updateQuestionCategories(false)
//   .then(() => console.log('Update completed.'))
//   .catch(console.error);