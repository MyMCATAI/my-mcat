import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function deleteUserStudyData(userId: string, dryRun: boolean = true) {
  try {
    // Find all calendar activities for the user
    const calendarActivities = await prisma.calendarActivity.findMany({
      where: { userId },
      include: {
        studyPlan: true
      }
    });

    // Find all study plans for the user
    const studyPlans = await prisma.studyPlan.findMany({
      where: { userId }
    });

    if (dryRun) {
      console.log('\n=== DRY RUN MODE ===');
      console.log(`Found ${calendarActivities.length} calendar activities to delete`);
      console.log(`Found ${studyPlans.length} study plans to delete`);
      
      console.log('\nCalendar Activities to be deleted:');
      calendarActivities.forEach(activity => {
        console.log(`- ${activity.activityTitle} (${activity.scheduledDate.toISOString()})`);
      });

      console.log('\nStudy Plans to be deleted:');
      studyPlans.forEach(plan => {
        console.log(`- Created: ${plan.creationDate.toISOString()}, Exam Date: ${plan.examDate.toISOString()}`);
      });
    } else {
      // Actually delete the data
      const deletedActivities = await prisma.calendarActivity.deleteMany({
        where: { userId }
      });

      const deletedPlans = await prisma.studyPlan.deleteMany({
        where: { userId }
      });

      console.log(`\nDELETED:`);
      console.log(`- ${deletedActivities.count} calendar activities`);
      console.log(`- ${deletedPlans.count} study plans`);
    }
  } catch (error) {
    console.error('Error processing user study data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Usage example:
const userId = process.argv[2];
const shouldDelete = process.argv[3] === 'commit';

if (!userId) {
  console.error('Please provide a userId as an argument');
  process.exit(1);
}

deleteUserStudyData(userId, !shouldDelete).catch(console.error);

// # Dry run mode (just shows what would be deleted)
// npm run delete-study-plan "userid"

// # Actually delete the data
// npm run delete-study-plan "userid" commit