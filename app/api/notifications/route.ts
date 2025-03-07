import { NextResponse } from 'next/server';
import prisma from "@/lib/prismadb";
import { auth } from '@clerk/nextjs/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                toUserId: userId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get user info for each notification
        const formattedNotifications = await Promise.all(notifications.map(async n => {
            const fromUser = await prisma.userInfo.findUnique({
                where: { userId: n.fromUserId }
            });

            return {
                id: n.id,
                type: n.type,
                status: n.status,
                fromUserId: n.fromUserId,
                fromUserName: fromUser?.firstName || 'Unknown',
                metadata: n.metadata,
                openedAt: n.openedAt,
                createdAt: n.createdAt.toISOString()
            };
        }));

        return NextResponse.json({ notifications: formattedNotifications });
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 