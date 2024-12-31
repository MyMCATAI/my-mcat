import { NextResponse } from "next/server";
import { getUserInfo } from "@/lib/user-info";
import prismadb from "@/lib/prismadb";


export async function GET(req: Request) {
  const userInfo = await getUserInfo();
  const referrals = await prismadb.referral.findMany({
    where: { userId: userInfo?.userId || "" },
    orderBy: { createdAt: "desc" },
  });

  if (!userInfo?.userId || !referrals) {
    return new Response("Required data not yet loaded", { status: 400 });
  }

  // Get all connections where user is either referrer or friend
  const connections = referrals.filter(referral => 
    referral.joinedAt !== null || referral.friendUserId !== null
  );

  // Extract all unique userIds from the connections
  const connectedUserIds = new Set<string>();
  connections.forEach(connection => {
    if (connection.userId) connectedUserIds.add(connection.userId);
    if (connection.friendUserId) connectedUserIds.add(connection.friendUserId);
  });
  connectedUserIds.add(userInfo?.userId || "");

  // Filter users and create map
  const userIds = Array.from(connectedUserIds);
  const connectedUserInfo = await prismadb.userInfo.findMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  const userIdMap = new Map(
    connectedUserInfo.map((user: any) => [
      user.userId,
      { firstName: user.firstName || "Mysterious Doctor", patientsTreated: 0 }
    ])
  );

  // Fetch and process patient records
  const connectedPatientRecords = await prismadb.patientRecord.findMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  // Update patientsTreated counts
  connectedPatientRecords.forEach((record: any) => {
    const userInfo = userIdMap.get(record.userId);
    if (userInfo) {
      userInfo.patientsTreated = record.patientsTreated;
    }
  });

  // Create leaderboard
  const leaderboard = Array.from(userIdMap.entries()).map(([_, value], index) => {
    const userInfo = value;
    return {
      id: index + 1,
      name: userInfo.firstName,
      patientsTreated: userInfo.patientsTreated
    };
  });

  return NextResponse.json(leaderboard);
}