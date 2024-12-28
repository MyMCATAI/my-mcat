import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

interface LeaderboardEntry {
    id: number;
    name: string;
    patientsTreated: number;
}

export async function GET(req: NextRequest) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const usersInfo = await prisma.patientRecord.findMany({
            take: 10,
            orderBy: {
                patientsTreated: 'desc'
            },
            include: {
                userInfo: {
                    select: {
                        firstName: true
                    }
                }
            }
        });

        let leaderboard: LeaderboardEntry[] = [];
        let counter = 1;
        for (let i = 0; i < usersInfo.length; i++) {
            // Check if the name is not null and starts with a letter
            if (!usersInfo[i].userInfo?.firstName) {
                continue;
            }
            leaderboard.push({
                id: counter,
                name: usersInfo[i].userInfo?.firstName || "Mysterious Doctor",
                patientsTreated: usersInfo[i].patientsTreated
            });
            counter++;
        }

        return NextResponse.json(leaderboard);
    } catch (error) {
        console.error('Error fetching global leaderboard:', error);
        return NextResponse.json({ error: 'Failed to fetch global leaderboard' }, { status: 500 });
    }
}