import { useState, useEffect } from 'react';
import { Mail, MailOpen } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import MailModal from '../social/notification/MailModal';

export const MailButton = () => {
    const [showMailModal, setShowMailModal] = useState(false);
    const { unreadCount } = useNotifications();
    const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);

    useEffect(() => {
        setLocalUnreadCount(unreadCount);
    }, [unreadCount]);

    const decrementUnreadCount = () => {
        setLocalUnreadCount(prev => Math.max(0, prev - 1));
    };

    // Only show badge if there are unread notifications
    const displayCount = localUnreadCount > 0 ? localUnreadCount : null;

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setShowMailModal(true)}
                    className="relative group"
                >
                    <div className="transform transition-transform duration-200 group-hover:scale-110">
                        {showMailModal ? (
                            <MailOpen 
                                className="w-8 h-8 fill-white" 
                                style={{
                                    stroke: 'url(#mailGradient)'
                                }}
                            />
                        ) : (
                            <Mail 
                                className="w-8 h-8 fill-white"
                                style={{
                                    stroke: 'url(#mailGradient)'
                                }}
                            />
                        )}
                        {/* SVG Gradient Definition */}
                        <svg width="0" height="0">
                            <defs>
                                <linearGradient id="mailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: 'var(--theme-gradient-startstreak)' }} />
                                    <stop offset="100%" style={{ stopColor: 'var(--theme-gradient-endstreak)' }} />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    {displayCount && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {displayCount}
                        </div>
                    )}
                </button>
            </div>

            <MailModal
                isOpen={showMailModal}
                onClose={() => setShowMailModal(false)}
                decrementUnreadCount={decrementUnreadCount}
            />
        </>
    );
}; 