import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function removeImageTags(dryRun: boolean = true) {
  try {
    // Find all questions with Complete.png, regardless of category
    const questionsToUpdate = await prisma.question.findMany({
      where: {
        questionContent: {
          contains: 'Complete.png'
        }
      }
    });

    console.log(`Found ${questionsToUpdate.length} questions with Complete.png`);

    // Debug: Let's look at some of the content
    console.log('\nSample of question content:');
    questionsToUpdate.slice(0, 5).forEach(q => {
      console.log('\n---Question Content---');
      console.log(q.questionContent);
    });

    if (questionsToUpdate.length === 0) {
      console.log('\nNo questions with Complete.png found');
      return;
    }

    if (dryRun) {
      console.log(`\n*** DRY RUN - No questions were modified ***`);
      
      // Show sample of changes that would be made
      console.log('\nSample of changes that would be made:');
      questionsToUpdate.slice(0, 3).forEach(q => {
        console.log(`\nQuestion ${q.questionID} (Category: ${q.contentCategory}):`);
        console.log('Original:', q.questionContent);
        console.log('Modified:', removeCompleteImgTags(q.questionContent));
      });
      
      console.log(`\nRun with dryRun=false to perform updates`);
    } else {
      // Perform the updates
      let updatedCount = 0;
      for (const question of questionsToUpdate) {
        const updatedContent = removeCompleteImgTags(question.questionContent);
        await prisma.question.update({
          where: { 
            id: question.id 
          },
          data: { 
            questionContent: updatedContent 
          }
        });
        updatedCount++;
      }
      
      console.log(`\n*** UPDATED ${updatedCount} questions - removed Complete.png image tags ***`);
    }

  } catch (error) {
    console.error(`Error removing image tags:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

function removeCompleteImgTags(content: string): string {
  // Remove both Anki-style and regular img tags containing Complete.png
  return content
    .replace(/{{c\d::(<img[^>]*src="[^"]*Complete\.png[^"]*"[^>]*>)}}/gi, '')
    .replace(/<img[^>]*src="[^"]*Complete\.png[^"]*"[^>]*>/gi, '');
}

// Get dry run flag from command line argument
const dryRun = process.argv[2] !== "false";

// Default to dry run for safety
removeImageTags(dryRun).catch(console.error); 