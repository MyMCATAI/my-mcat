import { NextResponse } from 'next/server';
import prisma from "@/lib/prismadb";
import { auth } from '@clerk/nextjs/server';

type CoinAction = 'send' | 'request' | 'accept' | 'reject';

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();

        const { action, toUserId, amount, notificationId } = body;

        // Validate required fields
        if (!action || !['send', 'request', 'accept', 'reject'].includes(action)) {
            return new NextResponse("Invalid action", { status: 400 });
        }

        if (!toUserId && !notificationId) {
            return new NextResponse("Missing recipient or notification", { status: 400 });
        }

        if ((action === 'send' || action === 'request') && (!amount || amount <= 0)) {
            return new NextResponse("Invalid amount", { status: 400 });
        }

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // Get sender info first
            const sender = await tx.userInfo.findUnique({
                where: { userId }
            });

            if (!sender) {
                throw new Error("User not found");
            }

            // Only check receiver for send/accept actions
            if (action === 'send' || action === 'accept') {
                const receiver = await tx.userInfo.findUnique({
                    where: { userId: toUserId }
                });
                if (!receiver) {
                    throw new Error("Recipient not found");
                }
            }

            // Get notification for accept/reject cases
            let requestNotification;
            if (action === 'accept' || action === 'reject') {
                requestNotification = await tx.notification.findUnique({
                    where: { id: notificationId }
                });

                if (!requestNotification || requestNotification.toUserId !== userId) {
                    throw new Error("Invalid notification");
                }

                if (action === 'accept' && (
                    requestNotification.type !== 'coin' ||
                    requestNotification.status !== 'active' ||
                    (requestNotification.metadata as any).action !== 'request'
                )) {
                    throw new Error("Invalid notification state");
                }
            }

            // Handle different actions
            switch (action) {
                case 'send':
                    // Check if sender has enough coins
                    if (sender.score < amount) {
                        throw new Error("Insufficient coins");
                    }

                    // Transfer coins
                    await tx.userInfo.update({
                        where: { userId },
                        data: { score: { decrement: amount } }
                    });

                    await tx.userInfo.update({
                        where: { userId: toUserId },
                        data: { score: { increment: amount } }
                    });

                    // Create notification for receiver
                    await tx.notification.create({
                        data: {
                            type: 'coin',
                            toUserId,
                            fromUserId: userId,
                            status: 'active',
                            metadata: {
                                action: 'send',
                                amount
                            }
                        }
                    });
                    break;

                case 'request':
                    // Create request notification
                    await tx.notification.create({
                        data: {
                            type: 'coin',
                            toUserId,
                            fromUserId: userId,
                            status: 'active',
                            metadata: {
                                action: 'request',
                                amount
                            }
                        }
                    });
                    break;

                case 'accept':
                    if (!requestNotification) return;
                    // Check if user has enough coins
                    if (sender.score < (requestNotification.metadata as any).amount) {
                        throw new Error("Insufficient coins");
                    }

                    // Transfer coins
                    const transferAmount = (requestNotification.metadata as any).amount;
                    await tx.userInfo.update({
                        where: { userId },
                        data: { score: { decrement: transferAmount } }
                    });

                    await tx.userInfo.update({
                        where: { userId: requestNotification.fromUserId },
                        data: { score: { increment: transferAmount } }
                    });

                    // Update notification status
                    await tx.notification.update({
                        where: { id: notificationId },
                        data: { status: 'accepted' }
                    });

                    // Create acceptance notification
                    await tx.notification.create({
                        data: {
                            type: 'coin',
                            toUserId: requestNotification.fromUserId,
                            fromUserId: userId,
                            status: 'active',
                            parentId: notificationId,
                            metadata: {
                                action: 'send',
                                amount: transferAmount
                            }
                        }
                    });
                    break;

                case 'reject':
                    if (!requestNotification) return;
                    // Update notification status
                    await tx.notification.update({
                        where: { id: notificationId },
                        data: { status: 'rejected' }
                    });

                    await tx.notification.create({
                        data: {
                            type: 'coin',
                            toUserId: requestNotification.fromUserId,
                            fromUserId: userId,
                            status: 'active',
                            parentId: notificationId,
                            metadata: {
                                action: 'reject',
                                amount
                            }
                        }
                    });
                    break;
            }

            return { success: true };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to process coin transaction:', error);
        return new NextResponse(
            error instanceof Error ? error.message : "Internal Error",
            { status: error instanceof Error ? 400 : 500 }
        );
    }
} 