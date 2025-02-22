import { NextResponse } from 'next/server';
import prisma from "@/lib/prismadb";
import { auth } from '@clerk/nextjs/server';

export async function POST(
    req: Request,
    { params }: { params: { notificationId: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const notification = await prisma.notification.update({
            where: {
                id: params.notificationId,
                toUserId: userId,
            },
            data: {
                openedAt: new Date(),
            },
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error("[NOTIFICATION_READ]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
} 