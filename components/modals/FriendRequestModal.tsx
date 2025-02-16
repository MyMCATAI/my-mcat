import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createPortal } from 'react-dom';
import FadingMessage from '../ui/FadingMessage';
import { useUserProfile } from '@/hooks/useUserProfile';
import Image from 'next/image';
import UserProfileModal from './UserProfileModal';

interface FriendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onSuccess?: () => Promise<void>;
}

const messages = {
  alreadyReferred: {
    message: "You've already friended this user. They'll be added once they enroll.",
    animation: "shake" as const
  },
  alreadyFriended: {
    message: "You're already friends with this user.",
    animation: "shake" as const
  },
  referralSuccess: {
    message: "Friend request sent! They'll be added once they enroll.",
    animation: "bounce" as const,
    iconAnimation: "checkmark" as const
  },
  friendSuccess: {
    message: "Friended user!",
    animation: "bounce" as const,
    iconAnimation: "checkmark" as const
  }
} as const;

const FriendRequestModal = ({ isOpen, onClose, userEmail, onSuccess }: FriendRequestModalProps) => {
  const { profile, isLoading: profileLoading } = useUserProfile(
    isOpen ? { email: userEmail } : null
  );
  const [isSelf, setIsSelf] = useState(false);
  const [message, setMessage] = useState<(typeof messages)[keyof typeof messages] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [referralData, setReferralData] = useState<{ 
    hasPendingReferral: boolean;
    exists?: boolean;
    isActiveFriend?: boolean;
  } | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!userEmail || !isOpen || profileLoading) return;
      
      setIsCheckingStatus(true);
      try {
        // Check if this is the current user
        const userResponse = await fetch('/api/user-info');
        const userData = await userResponse.json();
        const isSelfUser = userData.email.toLowerCase() === userEmail.toLowerCase();
        setIsSelf(isSelfUser);
        
        // Check referral/friend status
        const referralResponse = await fetch(`/api/referrals?checkExistence=true&email=${userEmail}`);
        const data = await referralResponse.json();
        setReferralData(data);
        
        if (data.exists) {
          setMessage(data.isActiveFriend ? messages.alreadyFriended : messages.alreadyReferred);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        toast.error('Failed to load user status');
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkUserStatus();
  }, [isOpen, userEmail, profileLoading]);

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendEmail: userEmail })
      });

      if (response.status === 400) {
        setMessage(messages.alreadyReferred);
      } else if (response.ok) {
        if (onSuccess) await onSuccess();
        setMessage(profile ? messages.friendSuccess : messages.referralSuccess);
      } else {
        throw new Error('Failed to process request');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send friend request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (profileLoading || isSubmitting || isCheckingStatus) {
    return createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] overflow-hidden">
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={onClose}
          style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <div className="bg-[--theme-mainbox-color] p-6 rounded-lg max-w-md w-full mx-4 z-10">
          <div className="flex flex-col gap-3 items-center justify-center py-8">
            <div className="text-[--theme-text-color]">
              {isSubmitting 
                ? !profile
                  ? "Sending referral..." 
                  : `Friending ${profile.firstName || 'user'}...`
                : "Kalypso's looking for the user..."}
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-hover-color]" />
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (message) {
    return createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] overflow-hidden">
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={onClose}
        />
        <FadingMessage 
          {...message} 
          duration={2000} 
          onComplete={() => {
            setMessage(null);
            onClose();
          }} 
        />
      </div>,
      document.body
    );
  }

  if (!profile) {
    return createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] overflow-hidden">
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={onClose}
          style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <div className="bg-[--theme-mainbox-color] p-6 rounded-lg max-w-md w-full mx-4 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="h-[53px] overflow-hidden">
              <Image
                src={referralData?.hasPendingReferral ? "/hero.gif" : "/gleamingcoin.gif"}
                alt={referralData?.hasPendingReferral ? "Hero" : "Coin"}
                width={referralData?.hasPendingReferral ? 120 : 100}
                height={53}
                className={`object-cover ${
                  referralData?.hasPendingReferral 
                    ? "translate-y-[-15%]" 
                    : "translate-y-[-22.5%]"
                }`}
              />
            </div>
            <h3 className="text-xl font-semibold text-[--theme-text-color]">
              {referralData?.hasPendingReferral ? "Friend New User" : "Refer a Friend"}
            </h3>
            <p className="text-[--theme-text-color]">
              {referralData?.hasPendingReferral ? (
                "This user isn't enrolled in MyMCAT yet. If you friend them, they will be added to your friends list once they enroll."
              ) : (
                <>
                  {"This person isn't enrolled in MyMCAT… But they could be! Refer them and get "}
                  <span className="font-bold text-yellow-400 animate-pulse">
                    10 coins
                  </span>{' '}
                  if they join?
                </>
              )}
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleAction}
              className="px-4 py-2 bg-[--theme-hover-color] text-[--theme-hover-text] rounded hover:opacity-80"
            >
              {referralData?.hasPendingReferral ? "Yes, friend them!" : "Yes, please!"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded hover:opacity-80 text-[--theme-text-color]"
            >
              {"Nah"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <UserProfileModal
      isOpen={isOpen}
      onClose={onClose}
      userEmail={userEmail}
      isEditable={false}
      showFriendButton={!isSelf && !referralData?.exists}
      onFriendRequest={handleAction}
    />,
    document.body
  );
};

export default FriendRequestModal; 