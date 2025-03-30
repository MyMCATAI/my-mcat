import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

// Check if the script should run in delete mode
const args = process.argv.slice(1);
const DELETE_MODE = args.includes('--delete');

async function cleanOrphanedRecords() {
  try {
    // Get all valid userIds from UserInfo table
    const userInfos = await prisma.userInfo.findMany({
      select: { userId: true }
    });
    
    const validUserIds = userInfos.map(user => user.userId);
    console.log(`Found ${validUserIds.length} valid users in UserInfo table`);
    
    if (DELETE_MODE) {
      console.log('⚠️ RUNNING IN DELETE MODE - ORPHANED RECORDS WILL BE DELETED ⚠️');
      await deleteOrphanedRecords(validUserIds);
    } else {
      console.log('Running in dry run mode - no records will be deleted');
      await countOrphanedRecords(validUserIds);
    }
    
  } catch (error) {
    console.error('Error processing orphaned records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function countOrphanedRecords(validUserIds: string[]) {
  // UserSubscription
  const orphanedSubscriptions = await prisma.userSubscription.count({
    where: {
      userId: {
        notIn: validUserIds,
        not: null // Skip null userIds
      }
    }
  });
  console.log(`Found ${orphanedSubscriptions} orphaned UserSubscription records`);
  
  // UserTest
  const orphanedTests = await prisma.userTest.count({
    where: {
      userId: {
        notIn: validUserIds
      }
    }
  });
  console.log(`Found ${orphanedTests} orphaned UserTest records`);
  
  // UserResponse (only check those with userId, as some may be linked via userTestId)
  const orphanedResponses = await prisma.userResponse.count({
    where: {
      userId: {
        notIn: validUserIds,
        not: null
      }
    }
  });
  console.log(`Found ${orphanedResponses} orphaned UserResponse records`);
  
  // StudyPlan
  const orphanedStudyPlans = await prisma.studyPlan.count({
    where: {
      userId: {
        notIn: validUserIds
      }
    }
  });
  console.log(`Found ${orphanedStudyPlans} orphaned StudyPlan records`);
  
  // CalendarActivity
  const orphanedActivities = await prisma.calendarActivity.count({
    where: {
      userId: {
        notIn: validUserIds
      }
    }
  });
  console.log(`Found ${orphanedActivities} orphaned CalendarActivity records`);
  
  // KnowledgeProfile
  const orphanedProfiles = await prisma.knowledgeProfile.count({
    where: {
      userId: {
        notIn: validUserIds
      }
    }
  });
  console.log(`Found ${orphanedProfiles} orphaned KnowledgeProfile records`);
  
  // PatientRecord
  const orphanedPatientRecords = await prisma.patientRecord.count({
    where: {
      userId: {
        notIn: validUserIds
      }
    }
  });
  console.log(`Found ${orphanedPatientRecords} orphaned PatientRecord records`);
  
  // Referral
  const orphanedReferrals = await prisma.referral.count({
    where: {
      userId: {
        notIn: validUserIds
      }
    }
  });
  console.log(`Found ${orphanedReferrals} orphaned Referral records`);
  
  // DataPulse
  const orphanedDataPulses = await prisma.dataPulse.count({
    where: {
      userId: {
        notIn: validUserIds
      }
    }
  });
  console.log(`Found ${orphanedDataPulses} orphaned DataPulse records`);
  
  // FullLengthExam
  const orphanedExams = await prisma.fullLengthExam.count({
    where: {
      userId: {
        notIn: validUserIds
      }
    }
  });
  console.log(`Found ${orphanedExams} orphaned FullLengthExam records`);
  
  // UserActivity
  const orphanedActivitiesLog = await prisma.userActivity.count({
    where: {
      userId: {
        notIn: validUserIds
      }
    }
  });
  console.log(`Found ${orphanedActivitiesLog} orphaned UserActivity records`);
  
  // Notification
  const orphanedNotificationsTo = await prisma.notification.count({
    where: {
      toUserId: {
        notIn: validUserIds
      }
    }
  });
  console.log(`Found ${orphanedNotificationsTo} orphaned Notification records (recipient)`);
  
  const orphanedNotificationsFrom = await prisma.notification.count({
    where: {
      fromUserId: {
        notIn: validUserIds,
        not: 'system' // Skip system notifications
      }
    }
  });
  console.log(`Found ${orphanedNotificationsFrom} orphaned Notification records (sender)`);
  
  // Calculate total orphaned records
  const totalOrphaned = 
    orphanedSubscriptions +
    orphanedTests +
    orphanedResponses +
    orphanedStudyPlans +
    orphanedActivities +
    orphanedProfiles +
    orphanedPatientRecords +
    orphanedReferrals +
    orphanedDataPulses +
    orphanedExams +
    orphanedActivitiesLog +
    orphanedNotificationsTo +
    orphanedNotificationsFrom;
  
  console.log(`Total orphaned records found: ${totalOrphaned}`);
  
  if (totalOrphaned > 0) {
    console.log('\nTo delete these orphaned records, run:');
    console.log('npx ts-node scripts/cleanOrphanedRecords.ts --delete');
  }
}

async function deleteOrphanedRecords(validUserIds: string[]) {
  // Use a transaction to ensure all operations succeed or fail together
  const results = await prisma.$transaction(async (tx) => {
    const deleteResults: Record<string, number> = {};
    
    // Delete in order of dependencies (children first, then parents)
    
    // CalendarActivity (depends on StudyPlan)
    const deleteActivities = await tx.calendarActivity.deleteMany({
      where: {
        userId: {
          notIn: validUserIds
        }
      }
    });
    deleteResults.calendarActivity = deleteActivities.count;
    
    // UserResponse (depends on UserTest)
    const deleteResponses = await tx.userResponse.deleteMany({
      where: {
        userId: {
          notIn: validUserIds,
          not: null
        }
      }
    });
    deleteResults.userResponse = deleteResponses.count;

    // FullLengthExam (depends on CalendarActivity)
    const deleteExams = await tx.fullLengthExam.deleteMany({
      where: {
        userId: {
          notIn: validUserIds
        }
      }
    });
    deleteResults.fullLengthExam = deleteExams.count;
    
    // DataPulse (depends on FullLengthExam)
    const deleteDataPulses = await tx.dataPulse.deleteMany({
      where: {
        userId: {
          notIn: validUserIds
        }
      }
    });
    deleteResults.dataPulse = deleteDataPulses.count;
    
    // UserTest
    const deleteTests = await tx.userTest.deleteMany({
      where: {
        userId: {
          notIn: validUserIds
        }
      }
    });
    deleteResults.userTest = deleteTests.count;
    
    // StudyPlan (after deleting CalendarActivity)
    const deleteStudyPlans = await tx.studyPlan.deleteMany({
      where: {
        userId: {
          notIn: validUserIds
        }
      }
    });
    deleteResults.studyPlan = deleteStudyPlans.count;
    
    // UserSubscription
    const deleteSubscriptions = await tx.userSubscription.deleteMany({
      where: {
        userId: {
          notIn: validUserIds,
          not: null
        }
      }
    });
    deleteResults.userSubscription = deleteSubscriptions.count;
    
    // KnowledgeProfile
    const deleteProfiles = await tx.knowledgeProfile.deleteMany({
      where: {
        userId: {
          notIn: validUserIds
        }
      }
    });
    deleteResults.knowledgeProfile = deleteProfiles.count;
    
    // PatientRecord
    const deletePatientRecords = await tx.patientRecord.deleteMany({
      where: {
        userId: {
          notIn: validUserIds
        }
      }
    });
    deleteResults.patientRecord = deletePatientRecords.count;
    
    // Referral
    const deleteReferrals = await tx.referral.deleteMany({
      where: {
        userId: {
          notIn: validUserIds
        }
      }
    });
    deleteResults.referral = deleteReferrals.count;
    
    // UserActivity
    const deleteActivitiesLog = await tx.userActivity.deleteMany({
      where: {
        userId: {
          notIn: validUserIds
        }
      }
    });
    deleteResults.userActivity = deleteActivitiesLog.count;
    
    // Notification (to)
    const deleteNotificationsTo = await tx.notification.deleteMany({
      where: {
        toUserId: {
          notIn: validUserIds
        }
      }
    });
    deleteResults.notificationTo = deleteNotificationsTo.count;
    
    // Notification (from)
    const deleteNotificationsFrom = await tx.notification.deleteMany({
      where: {
        fromUserId: {
          notIn: validUserIds,
          not: 'system'
        }
      }
    });
    deleteResults.notificationFrom = deleteNotificationsFrom.count;
    
    return deleteResults;
  }, {
    timeout: 30000 // Increase timeout to 30 seconds
  });
  
  // Log the results
  console.log('\n✅ Successfully deleted orphaned records:');
  let totalDeleted = 0;
  
  Object.entries(results).forEach(([table, count]) => {
    console.log(`- ${table}: ${count} records`);
    totalDeleted += count;
  });
  
  console.log(`\nTotal deleted: ${totalDeleted} orphaned records`);
}

cleanOrphanedRecords().catch(console.error); 