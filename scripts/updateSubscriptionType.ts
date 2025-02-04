import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSubscriptionType(dryRun: boolean = true) {
  try {
    // Get count of records that will be updated
    const userCount = await prisma.userInfo.count({
      where: {
        NOT: {
          subscriptionType: 'gold'
        }
      }
    });

    console.log(`Found ${userCount} users that need subscription type update`);

    if (dryRun) {
      console.log('DRY RUN: No records were updated');
      return;
    }

    // Perform the actual update
    const result = await prisma.userInfo.updateMany({
      where: {
        NOT: {
          subscriptionType: 'gold'
        }
      },
      data: {
        subscriptionType: 'gold'
      }
    });

    console.log(`Successfully updated ${result.count} users to gold subscription`);
  } catch (error) {
    console.error('Error updating subscription types:', error);
    throw error;
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const shouldExecute = args.includes('--execute');

updateSubscriptionType(!shouldExecute)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 