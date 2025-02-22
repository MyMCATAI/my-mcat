import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useUserInfoContext } from '@/contexts/UserInfoContext';

export type NotificationType = 'coin' | 'reply';
export type NotificationStatus = 'active' | 'canceled' | 'accepted' | 'rejected';
export type NotificationAction = 'accept' | 'reject';

export interface Notification {
    id: string;
    type: NotificationType;
    status: NotificationStatus;
    fromUserId: string;
    fromUserName?: string;
    metadata: {
        action: 'send' | 'request' | 'reject';
        amount: number;
    };
    openedAt: string;
    createdAt: string;
    lastUpdated: string;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const { refreshUserInfo } = useUserInfoContext();

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications');
            if (!response.ok) throw new Error();
            const data = await response.json();

            setNotifications(data.notifications);
            // Calculate unread count considering both openedAt and pendingReads
            setUnreadCount(
                data.notifications.filter((n: Notification) =>
                    !n.openedAt
                ).length
            );
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST'
            });

            if (!response.ok) throw new Error();

            // Update notification in state
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, openedAt: new Date().toISOString() }
                        : n
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            toast.error('Failed to mark as read');
            throw error; // Propagate error to component
        }
    }, []);

    const handleCoinAction = useCallback(async (notificationId: string, action: NotificationAction) => {
        try {
            const notification = notifications.find(n => n.id === notificationId);
            if (!notification) throw new Error("Notification not found");

            const { amount } = notification.metadata;

            const response = await fetch('/api/coin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    notificationId,
                    toUserId: notification.fromUserId,
                    amount
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            // Update notification status locally
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, status: action === 'accept' ? 'accepted' : 'rejected' }
                        : n
                )
            );

            // Refresh userInfo after coin transfer
            await refreshUserInfo();

            toast.success(
                action === 'accept'
                    ? `Sent ${amount} coins to ${notification.fromUserName}`
                    : `Rejected coin request from ${notification.fromUserName}`
            );
        } catch (error) {
            console.error('Failed to process coin action:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to process request');
        }
    }, [notifications, refreshUserInfo]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Set up WebSocket or polling for real-time updates
    useEffect(() => {
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return {
        notifications,
        isLoading,
        unreadCount,
        markAsRead,
        handleCoinAction,
        refresh: fetchNotifications
    };
}; 