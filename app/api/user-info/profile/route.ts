import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { getUserIdByEmail } from "@/lib/server-utils";

export async function GET(req: Request) {
    try {
        const { userId: authUserId } = auth();
        if (!authUserId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const url = new URL(req.url);
        const email = url.searchParams.get("email");
        const queryUserId = url.searchParams.get("userId");

        let targetUserId = authUserId;
        if (queryUserId) {
            targetUserId = queryUserId;
        } else if (email) {
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
                score: true
            }
        });

        if (!userInfo) {
            return new NextResponse("User info not found", { status: 404 });
        }

        const fullUserInfo = await prismadb.userInfo.findUnique({
            where: {
                userId: targetUserId
            }
        });

        return NextResponse.json({
            userId: targetUserId,
            firstName: userInfo.firstName,
            bio: userInfo.bio,
            coins: userInfo.score,
            profilePhoto: "doctor.png"
        });
    } catch (error) {
        console.log('[USER_PROFILE_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { bio } = body;

        const updatedInfo = await prismadb.userInfo.update({
            where: {
                userId
            },
            data: {
                ...(bio !== undefined && { bio })
            },
            select: {
                firstName: true,
                bio: true,
                score: true
            }
        });

        return NextResponse.json({
            firstName: updatedInfo.firstName,
            bio: updatedInfo.bio,
            coins: updatedInfo.score,
            profilePhoto: "doctor.png"
        });
    } catch (error) {
        console.log('[USER_PROFILE_PATCH]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 