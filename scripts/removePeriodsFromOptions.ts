const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function removePeriodsFromOptions(dryRun: boolean = true) {
  try {
    // Find all questions in CARS category
    const questions = await prisma.question.findMany({
      where: {
        contentCategory: 'CARs'
      }
    });

    console.log(`Found ${questions.length} CARS questions`);

    let modifiedCount = 0;
    let skippedCount = 0;

    for (const question of questions) {
      try {
        // Parse the options
        const options = JSON.parse(question.questionOptions);
        
        // Check if any option ends with a period
        const needsUpdate = options.some((option: string) => option.trim().endsWith('.'));
        
        if (!needsUpdate) {
          skippedCount++;
          continue;
        }

        // Remove periods from the end of each option
        const updatedOptions = options.map((option: string) => {
          let trimmed = option.trim();
          while (trimmed.endsWith('.')) {
            trimmed = trimmed.slice(0, -1).trim();
          }
          return trimmed;
        });

        if (dryRun) {
          console.log('\nWould update question:', question.id);
          console.log('Old options:', options);
          console.log('New options:', updatedOptions);
        } else {
          await prisma.question.update({
            where: { id: question.id },
            data: {
              questionOptions: JSON.stringify(updatedOptions)
            }
          });
          modifiedCount++;
        }
      } catch (error) {
        console.error(`Error processing question ${question.id}:`, error);
      }
    }

    console.log(`\nSummary:`);
    console.log(`- Total CARS questions: ${questions.length}`);
    console.log(`- Questions skipped (no periods): ${skippedCount}`);
    if (dryRun) {
      console.log(`- Questions that would be modified: ${modifiedCount}`);
      console.log('\nThis was a dry run. Run with dryRun=false to apply changes.');
    } else {
      console.log(`- Questions modified: ${modifiedCount}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get dry run flag from command line argument
const dryRun = process.argv[2] !== "false";

// Default to dry run for safety
removePeriodsFromOptions(dryRun).catch(console.error); 