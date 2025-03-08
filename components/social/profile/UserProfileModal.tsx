import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaPencilAlt } from 'react-icons/fa';
import Image from 'next/image';
import { SparkleEffect } from '@/components/effects/SparkleEffect';
import PhotoSelectionModal from './PhotoSelectionModal';
import { useUser } from '@/store/selectors';
import { CUSTOM_PARTICLES } from '@/config/particleEffects';
import { useUserProfile } from '@/hooks/useUserProfile';
import FriendMenu from '@/components/social/friend-interaction/FriendMenu';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userId?: string;
  isEditable?: boolean;
  onFriendRequest?: () => void;
  showFriendButton?: boolean;
  isSelfProfile?: boolean;
}

const ProfilePhoto = React.memo(({ 
  profilePhoto, 
  isEditable, 
  isClosing, 
  onPhotoClick, 
  isOpen 
}: {
  profilePhoto?: string;
  isEditable: boolean;
  isClosing: boolean;
  onPhotoClick: () => void;
  isOpen: boolean;
}) => {
  const IMAGE_SIZE = 128;
  const STROKE_WIDTH = 2;
  const particleConfig = CUSTOM_PARTICLES[profilePhoto || 'doctor.png'] || { particles: [], dispersion: 'burst' };
  const CIRCLE_RADIUS = 76;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
  const [hasDrawnInitialCircle, setHasDrawnInitialCircle] = useState(false);

  // Reset animation state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasDrawnInitialCircle(false);
    } else if (!hasDrawnInitialCircle) {
      setHasDrawnInitialCircle(true);
    }
  }, [isOpen]);

  return (
    <div className="relative w-[150px] h-[150px]">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <SparkleEffect 
          enabled={true}
          customParticle={particleConfig.particles}
          dispersion={particleConfig.dispersion}
          size="small"
        >
          <div className="relative w-[160px] h-[160px] flex items-center justify-center">
            <div 
              className={`
                rounded-full overflow-visible relative
                ${isEditable ? 'cursor-pointer' : ''}
                w-[128px] h-[128px]
              `}
              onClick={onPhotoClick}
            >
              {/* Animated outline */}
              {isEditable && (
                <div 
                  className="absolute w-[150px] h-[150px]"
                  style={{ 
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <svg 
                    width="100%"
                    height="100%"
                    viewBox="0 0 160 160"
                    className="absolute inset-0"
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r="76"
                      fill="none"
                      stroke="var(--theme-hover-color)"
                      strokeWidth={STROKE_WIDTH}
                      className={`${hasDrawnInitialCircle ? 'animate-circle-draw' : ''} ${isClosing ? 'circle-undraw' : ''}`}
                    />
                  </svg>
                </div>
              )}

              {/* Image */}
              <Image
                key={profilePhoto}
                src={`/profile-photo/${profilePhoto || 'doctor.png'}`}
                alt="Profile"
                width={IMAGE_SIZE}
                height={IMAGE_SIZE}
                className={`
                  rounded-full
                  ${isEditable ? 'cursor-pointer' : ''}
                `}
                quality={100}
                style={{ 
                  opacity: 1,
                  transition: 'opacity 300ms',
                }}
                onLoadingComplete={(img) => {
                  if (img.src.includes(profilePhoto || 'doctor.png')) {
                    img.style.opacity = "1";
                  }
                }}
              />
            </div>
          </div>
        </SparkleEffect>
      </div>
      <style jsx global>{`
        .animate-circle-draw {
          stroke-dasharray: ${CIRCLE_CIRCUMFERENCE};
          stroke-dashoffset: ${CIRCLE_CIRCUMFERENCE};
          animation: circle-draw 1s ease-out forwards;
        }

        .circle-undraw {
          animation: circle-undraw 0.3s ease-in forwards;
        }

        @keyframes circle-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes circle-undraw {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: ${CIRCLE_CIRCUMFERENCE};
          }
        }
      `}</style>
    </div>
  );
});

ProfilePhoto.displayName = 'ProfilePhoto';

const UserProfileModal = ({ isOpen, onClose, userEmail, userId, isEditable = false, onFriendRequest, showFriendButton = false, isSelfProfile = false }: UserProfileModalProps) => {
  const { profile: selfProfile, profileLoading: selfProfileLoading, updateProfile } = useUser();
  // Only use useUserProfile for other users' profiles
  const profileParams = React.useMemo(() => {
    if (!isOpen || isSelfProfile) return null;
    if (userEmail) return { email: userEmail };
    if (userId) return { userId };
    return null;
  }, [isOpen, userEmail, userId, isSelfProfile]);

  const { profile: otherProfile, isLoading: userProfileLoading } = useUserProfile(profileParams);
  
  // Use either self profile or other profile
  const displayProfile = isSelfProfile ? selfProfile : otherProfile;
  const isLoading = isSelfProfile ? selfProfileLoading : userProfileLoading;
  const [editBio, setEditBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSelectingPhoto, setIsSelectingPhoto] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Reset bio and editing state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEditBio(displayProfile?.bio || '');
    } else {
      setEditBio('');
      setIsEditing(false);
    }
  }, [isOpen, displayProfile?.bio]);

  // Update bio when starting to edit
  const handleStartEditing = () => {
    setEditBio(displayProfile?.bio || '');
    setIsEditing(true);
  };

  // Handle cancel - reset to original bio
  const handleCancelEdit = () => {
    setEditBio(displayProfile?.bio || '');
    setIsEditing(false);
  };

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match transition duration
  };

  // Move useCallback before any returns
  const handlePhotoClick = useCallback(() => {
    if (isEditable) {
      setIsSelectingPhoto(true);
    }
  }, [isEditable]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (isEditable) {
      await updateProfile({ bio: editBio });
      setIsEditing(false);
    }
  };

  const handlePhotoSelect = async (photoName: string) => {
    if (isEditable) {
      try {
        await updateProfile({ profilePhoto: photoName });
        setIsSelectingPhoto(false);
      } catch (error) {
        console.error('Failed to update profile photo:', error);
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] overflow-hidden">
      <div 
        className="fixed inset-0" 
        onClick={handleClose}
      />
      <div 
        className={`
          bg-[--theme-mainbox-color] p-6 rounded-xl max-w-md w-full mx-4 z-10 
          relative shadow-lg border border-[--theme-border-color]
          transition-[transform,opacity] duration-300 overflow-visible
          ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        <div className="absolute top-4 right-4 z-50">
          {!isLoading && !isEditable && !isSelfProfile && !showFriendButton && (
            <FriendMenu 
              friendId={displayProfile?.userId || ''}
              friendName={displayProfile?.firstName || 'Friend'}
              friendCoins={displayProfile?.coins || 0}
              selfCoins={selfProfile?.coins || 0}
            />
          )}
        </div>

        <div 
          className="transition-[max-height,opacity] duration-300 ease-in-out overflow-visible"
          style={{ 
            maxHeight: isClosing ? '0px' 
              : isLoading ? '200px' 
              : '800px',
            opacity: isClosing ? '0' 
              : isLoading ? '0.7' 
              : '1'
          }}
        >
          {isLoading ? (
          <div className="flex flex-col gap-3 items-center justify-center py-8">
              <div className="text-[--theme-text-color]">Loading profile...</div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-hover-color]" />
            </div>
          ) : !displayProfile ? (
          <div className="text-center text-[--theme-text-color]">
            User not found
          </div>
        ) : (
            <div className="relative">
              <div className="flex gap-8">
                <ProfilePhoto 
                  profilePhoto={displayProfile?.profilePhoto}
                  isEditable={isEditable}
                  isClosing={isClosing}
                  onPhotoClick={handlePhotoClick}
                  isOpen={isOpen}
                />

                {/* Right side - User Info */}
                <div className="flex-1">
                  {/* Edit/Friend Button */}
                  <div className="flex justify-end mb-2">
                    {isEditable ? (
                      <button
                        onClick={() => {
                          if (isEditing) {
                            handleCancelEdit();
                          } else {
                            handleStartEditing();
                          }
                        }}
                        className={`
                          p-2 rounded-full 
                          transition-all duration-300 ease-out
                          ${isEditing 
                            ? 'bg-[--theme-hover-color] text-white hover:bg-[--theme-hover-color]/90' 
                            : 'text-[--theme-text-color] hover:text-[--theme-hover-color] hover:bg-[--theme-hover-color]/10 hover:rotate-12'
                          }
                        `}
                      >
                        <FaPencilAlt className="w-5 h-5" />
                      </button>
                    ) : showFriendButton && (
                      <button
                        onClick={onFriendRequest}
                        className="px-4 py-2 bg-[--theme-hover-color] text-[--theme-hover-text] rounded hover:opacity-80"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="space-y-2">
                    <h3 className="text-[--theme-text-color] font-medium">
                      {displayProfile?.firstName || 'Your username'}
                  </h3>
                    <div className="bg-[--theme-botchatbox-color]/30 p-2 rounded mb-2">
                      <p className="text-[--theme-text-color] text-sm">
                        {displayProfile?.coins?.toLocaleString() || '0'} Coins
                      </p>
                    </div>
                    <div className="bg-[--theme-botchatbox-color]/30 p-2 rounded">
                      <p className="text-[--theme-text-color] text-sm">
                        {displayProfile?.patientsCount?.toLocaleString() || '0'} Patients treated
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-[--theme-text-color] mb-2">Bio</h4>
                <div 
                  className={`
                    transition-[height] duration-300 ease-in-out w-full overflow-visible
                    ${isEditing ? 'h-[200px]' : 'h-[100px]'}
                  `}
                >
                  {isEditable && isEditing ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 w-full overflow-visible">
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full p-3 rounded-lg bg-[--theme-botchatbox-color] text-[--theme-text-color] border border-[--theme-border-color] focus:outline-none focus:ring-2 focus:ring-[--theme-hover-color]"
                        rows={4}
                        placeholder="Write something about yourself..."
                      />
                      <div className="flex justify-end gap-2 overflow-visible">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 rounded-lg text-[--theme-text-color]/90 hover:text-[--theme-text-color] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className={`
                            px-4 py-2 rounded-lg font-medium
                            bg-[--theme-hover-color] text-white
                            transition-all duration-300 ease-out
                            hover:bg-[--theme-hover-color]/90
                            hover:scale-105
                            active:scale-95
                          `}
                        >
                          Save
                        </button>
              </div>
            </div>
                  ) : (
                    <div 
                      className={`
                        bg-[--theme-botchatbox-color]/30 p-3 rounded-lg w-full
                        transition-[height] duration-300 ease-in-out
                      `}
                    >
                <p className="text-[--theme-text-color]">
                        {displayProfile?.bio || 'No bio available'}
                </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}
        </div>
      </div>
      
      {/* Photo Selection Modal */}
      {isSelectingPhoto && (
        <PhotoSelectionModal
          isOpen={isSelectingPhoto}
          onClose={() => setIsSelectingPhoto(false)}
          onSelect={handlePhotoSelect}
          currentPhoto={displayProfile?.profilePhoto}
        />
      )}
    </div>,
    document.body
  );
};

export default UserProfileModal; 