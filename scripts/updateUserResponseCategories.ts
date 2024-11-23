import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function updateUserResponseCategories() {
  try {
    // Find all UserResponses with null categoryId
    const userResponses = await prisma.userResponse.findMany({
      where: {
        categoryId: null,
      },
      select: {
        id: true,
        questionId: true,
      },
    });

    console.log(`Found ${userResponses.length} responses with missing categoryId`);

    // Update each response
    for (const response of userResponses) {
      try {
        // Get the question's categoryId
        const question = await prisma.question.findUnique({
          where: { id: response.questionId },
          select: { categoryId: true },
        });

        if (!question) {
          console.error(`No question found for response ${response.id}`);
          continue;
        }

        // Update the UserResponse with the correct categoryId
        await prisma.userResponse.update({
          where: { id: response.id },
          data: { categoryId: question.categoryId },
        });

        console.log(`Updated response ${response.id} with categoryId ${question.categoryId}`);
      } catch (error) {
        console.error(`Error updating response ${response.id}:`, error);
      }
    }

    console.log('Finished updating user responses');
  } catch (error) {
    console.error('Error in update script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserResponseCategories().catch(console.error);