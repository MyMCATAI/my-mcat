import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { getUserIdByEmail } from "@/lib/server-utils";

export async function GET(req: Request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const url = new URL(req.url);
        const email = url.searchParams.get("email");

        let targetUserId = userId;
        if (email) {
            const emailUserId = await getUserIdByEmail(email);
            if (!emailUserId) {
                return new NextResponse("User not found", { status: 404 });
            }
            targetUserId = emailUserId;
        }

        const userInfo = await prismadb.userInfo.findUnique({
            where: {
                userId: targetUserId
            },
            select: {
                firstName: true,
                bio: true,
                score: true,
                patientRecord: {
                    select: {
                        patientsTreated: true
                    }
                }
            }
        });

        if (!userInfo) {
            return new NextResponse("User info not found", { status: 404 });
        }

        return NextResponse.json({
            firstName: userInfo.firstName,
            bio: userInfo.bio,
            coins: userInfo.score,
            patientsCount: userInfo.patientRecord?.patientsTreated || 0
        });
    } catch (error) {
        console.log('[USER_PROFILE_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 