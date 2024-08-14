import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

// Careful, this deletes a lot of user things
export async function DELETE(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete all user responses for the given userId
    await prisma.userResponse.deleteMany({
      where: {
        userTest: {
          userId: userId
        }
      }
    });

    // Delete all knowledge profiles for the given userId
    await prisma.knowledgeProfile.deleteMany({
      where: {
        userId: userId
      }
    });

    // Delete all calendar activities for the given userId
    await prisma.calendarActivity.deleteMany({
      where: {
        userId: userId
      }
    });

    return NextResponse.json({ message: "All user data reset successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error resetting user data:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}