import React from 'react';
import { createPortal } from 'react-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const UserProfileModal = ({ isOpen, onClose, userEmail }: UserProfileModalProps) => {
  const { profile, isLoading: profileLoading } = useUserProfile(isOpen ? userEmail : null);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] overflow-hidden">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <div className="bg-[--theme-mainbox-color] p-6 rounded-lg max-w-md w-full mx-4 z-10">
        {profileLoading ? (
          <div className="flex flex-col gap-3 items-center justify-center py-8">
            <div className="text-[--theme-text-color]">
              {"Kalypso's looking for the user..."}
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-hover-color]" />
          </div>
        ) : !profile ? (
          <div className="text-center text-[--theme-text-color]">
            User not found
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[--theme-border-color] flex items-center justify-center select-none">
                  👤
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[--theme-text-color]">
                    {profile?.firstName || 'User'}
                  </h3>
                  <p className="text-[--theme-text-color] opacity-90">{userEmail}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-[--theme-text-color]">Bio</label>
                <p className="text-[--theme-text-color]">
                  {profile?.bio || 'No bio available'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default UserProfileModal; 