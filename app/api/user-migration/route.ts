import { NextResponse } from "next/server";
import { devUsers } from "@/data/dev-users";
import prisma from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { getUserEmail } from "@/lib/server-utils";

export async function POST() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userEmail = await getUserEmail(userId)

    // First check if email matches any dev users
    const devUser = devUsers.find(du => du.primary_email_address === userEmail);

    if (!devUser) {
      console.log("No matching dev user found for email:", userEmail);
      return NextResponse.json({ 
        needsMigration: false,
      });
    }

    // Then check if there's an existing user with the dev user's ID
    const existingUserInfo = await prisma.userInfo.findUnique({
      where: { userId: devUser.id }
    });
    console.log("Existing UserInfo for dev user:", existingUserInfo);

    if (!existingUserInfo) {
      console.log("No existing user info found for devUserId:", devUser.id);
      return NextResponse.json({ 
        needsMigration: false,
      });
    }

    // Check if the new user already has UserInfo
    const newUserInfo = await prisma.userInfo.findUnique({
      where: { userId }
    });
    console.log("New UserInfo:", newUserInfo);

    // If new user already has a devUserId, they've been migrated should need to call this
    if (newUserInfo?.devUserId) {
      console.log("User already migrated with devUserId:", newUserInfo.devUserId);
      return NextResponse.json({ 
        needsMigration: false,
      });
    }

    // Perform migration
    await prisma.$transaction(async (tx) => {
      console.log(`Starting migration for user ${userId} with devUserId ${devUser.id}.`);
      
      // Update UserInfo
      console.log("Updating UserInfo for devUserId:", devUser.id);
      await tx.userInfo.update({
        where: { userId: devUser.id },
        data: { 
          userId: userId,
          devUserId: devUser.id 
        }
      });

      // Update UserSubscription
      console.log("Updating UserSubscription for devUserId:", devUser.id);
      await tx.userSubscription.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });

      // Update UserTest
      console.log("Updating UserTest for devUserId:", devUser.id);
      await tx.userTest.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });

      // Update UserResponse
      console.log("Updating UserResponse for devUserId:", devUser.id);
      await tx.userResponse.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });

      // Update UserActivity
      console.log("Updating UserActivity for devUserId:", devUser.id);
      await tx.userActivity.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });

      // Update StudyPlan
      console.log("Updating StudyPlan for devUserId:", devUser.id);
      await tx.studyPlan.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });

      // Update KnowledgeProfile
      console.log("Updating KnowledgeProfile for devUserId:", devUser.id);
      await tx.knowledgeProfile.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });

      // Update PatientRecord
      console.log("Updating PatientRecord for devUserId:", devUser.id);
      await tx.patientRecord.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });

      // Update CalendarActivity
      console.log("Updating CalendarActivity for devUserId:", devUser.id);
      await tx.calendarActivity.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });

      // Update DataPulse
      console.log("Updating DataPulse for devUserId:", devUser.id);
      await tx.dataPulse.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });

      // Update FullLengthExam
      console.log("Updating FullLengthExam for devUserId:", devUser.id);
      await tx.fullLengthExam.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });

      // Update Referral - both userId and friendUserId fields
      console.log("Updating Referral for devUserId:", devUser.id);
      await tx.referral.updateMany({
        where: { userId: devUser.id },
        data: { userId }
      });
      console.log("Updating Referral friendUserId for devUserId:", devUser.id);
      await tx.referral.updateMany({
        where: { friendUserId: devUser.id },
        data: { friendUserId: userId }
      });

      console.log(`Migration completed for user ${userId}.`);
    });

    return NextResponse.json({ 
      needsMigration: true,
      migrationComplete: true,
      email: userEmail,
      oldUserId: devUser.id,
      newUserId: userId
    });

  } catch (error) {
    console.error("[USER_MIGRATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 