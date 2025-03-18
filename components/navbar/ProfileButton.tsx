import React, { useState, useEffect, memo } from 'react';
import { useClerk, useUser as useClerkUser } from '@clerk/nextjs';
import { FaUser, FaUserCog, FaSignOutAlt } from 'react-icons/fa';
import UserProfileModal from '../social/profile/UserProfileModal';
import { useProfilePhoto } from '@/store/selectors';
import Image from 'next/image';
import { createPortal } from 'react-dom';

const ProfileImage = memo(({ profilePhoto }: { profilePhoto: string | undefined }) => {
  return (
    <Image
      key={profilePhoto} // Now safe to use key here since component is memoized
      src={`/profile-photo/${profilePhoto || 'doctor.png'}`}
      alt="Profile"
      width={64}
      height={64}
      className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
      quality={100}
      onLoad={(e) => {
        (e.target as HTMLImageElement).classList.remove('opacity-0');
      }}
      priority
      unoptimized
    />
  );
});

ProfileImage.displayName = 'ProfileImage';

export const ProfileButton = memo(({hideProfile}: {hideProfile?: boolean}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const { openUserProfile, signOut } = useClerk();
  const { user } = useClerkUser();
  const profilePhoto = useProfilePhoto();

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Profile Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-12 h-12 rounded-full overflow-hidden bg-[--theme-hover-color]/20 flex items-center justify-center hover:bg-[--theme-hover-color]/30 transition-colors relative group"
      >
        {/* Gleam effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        </div>
        
        {/* Profile Image */}
        <ProfileImage profilePhoto={profilePhoto} />
      </button>

      {/* Menu Dropdown - Rendered as a Portal */}
      {isMenuOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={menuRef}
          className="fixed shadow-xl z-[9999] bg-white rounded-md overflow-hidden border border-gray-200"
          style={{
            width: '192px', // w-48
            top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 4 : 0,
            left: buttonRef.current ? buttonRef.current.getBoundingClientRect().right - 192 : 0,
          }}
        >
          {!hideProfile && (
            <button
              onClick={() => {
                setIsProfileModalOpen(true);
                setIsMenuOpen(false);
              }}
              className="w-full px-2 py-1.5 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
            >
              <FaUser className="w-4 h-4" />
              Customize profile
            </button>
          )}
          <button
            onClick={() => {
              openUserProfile();
              setIsMenuOpen(false);
            }}
            className="w-full px-2 py-1.5 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
          >
            <FaUserCog className="w-4 h-4" />
            Account & Security
          </button>
          <button
            onClick={() => signOut()}
            className="w-full px-2 py-1.5 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
          >
            <FaSignOutAlt className="w-4 h-4" />
            Sign out
          </button>
        </div>,
        document.body
      )}

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail={user?.primaryEmailAddress?.emailAddress || ''}
        isEditable={true}
        isSelfProfile={true}
      />
    </>
  );
});

ProfileButton.displayName = 'ProfileButton';

export default ProfileButton; 