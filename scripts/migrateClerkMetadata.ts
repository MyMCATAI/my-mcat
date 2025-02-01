import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { clerkClient } from "@clerk/nextjs/server";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function migrateClerkMetadata(dryRun = true) {
  try {
    console.log(`Starting Clerk metadata migration... (${dryRun ? 'DRY RUN' : 'LIVE RUN'})`);
    if (dryRun) {
      console.log('⚠️  This is a dry run. No changes will be made to the database.');
      console.log('To perform actual updates, run with dryRun = false\n');
    }

    // Get all users from our database
    const userInfos = await prisma.userInfo.findMany();
    console.log(`Found ${userInfos.length} users in database`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const userInfo of userInfos) {
      try {
        // Fetch single Clerk user
        let clerkUser;
        try {
          clerkUser = await clerkClient.users.getUser(userInfo.userId);
        } catch (error) {
          console.log(`Could not fetch Clerk user for userId: ${userInfo.userId}`);
          skippedCount++;
          continue;
        }

        const metadata = clerkUser.unsafeMetadata as any;
        if (!metadata) {
          console.log(`No metadata found for user: ${userInfo.userId}`);
          skippedCount++;
          continue;
        }

        // Only include fields that exist in metadata
        const onboardingData: Record<string, any> = {
          firstName: userInfo.firstName, // Keep existing firstName
        };

        // Only add fields that exist in metadata
        if ('college' in metadata) onboardingData.college = metadata.college;
        if ('isNonTraditional' in metadata) onboardingData.isNonTraditional = metadata.isNonTraditional;
        if ('isCanadian' in metadata) onboardingData.isCanadian = metadata.isCanadian;
        if ('gpa' in metadata) onboardingData.gpa = metadata.gpa;
        if ('diagnosticScore' in metadata) onboardingData.currentMcatScore = metadata.diagnosticScore;
        if ('hasNotTakenMCAT' in metadata) onboardingData.hasNotTakenMCAT = metadata.hasNotTakenMCAT;
        if ('attemptNumber' in metadata) onboardingData.mcatAttemptNumber = metadata.attemptNumber;
        if ('targetScore' in metadata) onboardingData.targetScore = metadata.targetScore;
        if ('targetMedSchool' in metadata) onboardingData.targetMedSchool = metadata.targetMedSchool;
        if ('onboardingComplete' in metadata) onboardingData.onboardingComplete = metadata.onboardingComplete;
        if ('currentStep' in metadata) onboardingData.currentStep = metadata.currentStep;

        // Only update if we have data to migrate
        if (Object.keys(onboardingData).length > 1) { // > 1 because firstName is always included
          if (dryRun) {
            console.log('\n-------------------');
            console.log(`Would update user: ${userInfo.userId}`);
            console.log('Current firstName:', userInfo.firstName);
            console.log('Current onboardingInfo:', userInfo.onboardingInfo || 'none');
            console.log('Would set onboardingInfo to:', onboardingData);
            console.log('Fields to migrate:', Object.keys(onboardingData).join(', '));
            console.log('-------------------');
          } else {
            await prisma.userInfo.update({
              where: { userId: userInfo.userId },
              data: {
                onboardingInfo: onboardingData
              }
            });
            console.log(`Successfully migrated data for user: ${userInfo.userId}`);
            console.log('Migrated fields:', Object.keys(onboardingData).join(', '));
          }
          successCount++;
        } else {
          console.log(`No metadata fields to migrate for user: ${userInfo.userId}`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error processing user ${userInfo.userId}:`, error);
        errorCount++;
      }
    }

    console.log("\nMigration Summary:");
    console.log(`Total users processed: ${userInfos.length}`);
    if (dryRun) {
      console.log(`Would succeed: ${successCount}`);
    } else {
      console.log(`Successful migrations: ${successCount}`);
    }
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration in dry-run mode by default
migrateClerkMetadata(true).catch(console.error); 