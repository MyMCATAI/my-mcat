import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, NotificationAction } from '@/hooks/useNotifications';
import { MailCheck, Check, X } from 'lucide-react';

interface MailModalProps {
  isOpen: boolean;
  onClose: () => void;
  decrementUnreadCount: () => void;
}

const MailModal: React.FC<MailModalProps> = ({ isOpen, onClose, decrementUnreadCount }) => {
  const [isClosing, setIsClosing] = useState(false);
  const { notifications, isLoading, handleCoinAction, markAsRead } = useNotifications();
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const [localPendingReads, setLocalPendingReads] = useState<Set<string>>(new Set());

  const handleAction = async (notificationId: string, action: NotificationAction) => {
    setPendingActions(prev => new Set(prev).add(notificationId));
    try {
      await handleCoinAction(notificationId, action);
    } finally {
      setPendingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    // Optimistically update UI
    setLocalPendingReads(prev => new Set(prev).add(notificationId));
    decrementUnreadCount();

    try {
      await markAsRead(notificationId);
    } catch (error) {
      // Revert optimistic updates on error
      setLocalPendingReads(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      decrementUnreadCount(); // Increment back on error
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const renderNotification = (notification: Notification) => {
    if (notification.type === 'coin') {
      const { action, amount } = notification.metadata;
      const isRead = notification.openedAt || localPendingReads.has(notification.id);
      const isPending = pendingActions.has(notification.id);
      
      return (
        <div 
          key={notification.id}
          className={`
            p-4 rounded-lg mb-2 relative
            ${isRead ? 'bg-[--theme-botchatbox-color]/30' : 'bg-[--theme-botchatbox-color]/50'}
          `}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-[--theme-text-color] mb-2">
                {action === 'send' && `${notification.fromUserName} sent you ${amount} coins!`}
                {action === 'request' && `${notification.fromUserName} requested ${amount} coins!`}
                {action === 'reject' && `${notification.fromUserName} rejected your coin request...`}
              </p>
              
              {/* Status Indicators */}
              {notification.metadata.action === 'request' && (
                <>
                  {notification.status === 'accepted' && (
                    <div className="flex items-center gap-1 text-green-500 text-sm mb-2">
                      <Check size={16} />
                      <span>Accepted</span>
                    </div>
                  )}
                  {notification.status === 'rejected' && (
                    <div className="flex items-center gap-1 text-red-500 text-sm mb-2">
                      <X size={16} />
                      <span>Rejected</span>
                    </div>
                  )}
                </>
              )}

              {/* Action buttons for active requests */}
              {action === 'request' && notification.status === 'active' && (
                <div className="flex gap-2 mb-2">
                  {isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[--theme-hover-color]" />
                  ) : (
                    <>
                      <button
                        onClick={() => handleAction(notification.id, 'accept')}
                        className="px-3 py-1 bg-[--theme-hover-color] text-white rounded-lg hover:opacity-90"
                        disabled={isPending}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(notification.id, 'reject')}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:opacity-90"
                        disabled={isPending}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              )}

              <span className="text-xs text-[--theme-text-color] opacity-90">
                {new Date(notification.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={() => !isRead && handleMarkAsRead(notification.id)}
                className={`
                  p-1 rounded-full transition-colors
                  ${isRead 
                    ? 'text-[--theme-text-color]/30 cursor-default' 
                    : 'text-[--theme-text-color] hover:bg-[--theme-hover-color]/10 cursor-pointer'
                  }
                `}
              >
                <MailCheck className="w-5 h-5" />
              </button>
              {!isRead && (
                <div className="
                  absolute right-0 top-full mt-1 px-2 py-1 
                  bg-[--theme-mainbox-color] rounded text-xs text-[--theme-text-color]
                  border border-[--theme-border-color] whitespace-nowrap
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200 z-10
                ">
                  Mark as read
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div 
        className="absolute inset-0" 
        onClick={handleClose}
      />
      <div 
        className={`
          bg-[--theme-mainbox-color] p-6 rounded-xl max-w-md w-full mx-4
          relative shadow-lg border border-[--theme-border-color] z-10
          transition-[transform,opacity] duration-300 overflow-visible
          ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        <div 
          className="transition-[max-height,opacity] duration-300 ease-in-out overflow-visible"
          style={{ 
            maxHeight: isClosing ? '0px' : '800px',
            opacity: isClosing ? '0' : '1'
          }}
        >
          <h3 className="text-lg font-medium mb-4 text-[--theme-text-color]">
            Mail
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-hover-color]" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-[--theme-text-color] text-center py-4">
              Meow, such empty
            </p>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.map(renderNotification)}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MailModal; 