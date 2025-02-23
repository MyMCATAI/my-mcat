import React, { useState, useEffect } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { FaUser, FaUserCog, FaSignOutAlt } from 'react-icons/fa';
import UserProfileModal from '../social/profile/UserProfileModal';
import { useProfileContext } from '@/contexts/UserProfileContext';
import Image from 'next/image';

export const ProfileButton = ({hideProfile}: {hideProfile?: boolean}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { openUserProfile, signOut } = useClerk();
  const { user } = useUser();
  const { profile, isLoading } = useProfileContext();

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-12 h-12 rounded-full overflow-hidden bg-[--theme-hover-color]/20 flex items-center justify-center hover:bg-[--theme-hover-color]/30 transition-colors relative group"
      >
        {/* Gleam effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        </div>
        
        {/* Profile Image with Loading State */}
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[--theme-hover-color] border-t-transparent" />
          </div>
        ) : (
          <Image
            key={profile?.profilePhoto}
            src={`/profile-photo/${profile?.profilePhoto || 'doctor.png'}`}
            alt="Profile"
            width={64}
            height={64}
            className="w-full h-full object-cover transition-opacity duration-300"
            quality={100}
            style={{ opacity: 0 }}
            onLoadingComplete={(img) => {
              img.style.opacity = "1";
            }}
            onLoad={(e) => {
              (e.target as HTMLImageElement).style.opacity = "1";
            }}
            priority
            unoptimized
          />
        )}
      </button>

      {/* Menu Dropdown */}
      <div 
        className={`
          absolute right-0 top-full mt-1 w-48 rounded-md overflow-hidden bg-white shadow-lg 
          border border-gray-200 text-gray-700 text-base whitespace-nowrap z-[1000]
          transition-all duration-200 origin-top
          ${isMenuOpen 
            ? 'transform scale-y-100 opacity-100' 
            : 'transform scale-y-0 opacity-0 pointer-events-none'
          }
        `}
      >
        {!hideProfile && (
          <button
            onClick={() => {
              setIsProfileModalOpen(true);
              setIsMenuOpen(false);
            }}
          className="w-full px-2 py-1.5 text-left hover:bg-gray-50 flex items-center gap-2"
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
          className="w-full px-2 py-1.5 text-left hover:bg-gray-50 flex items-center gap-2"
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
      </div>

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail={user?.primaryEmailAddress?.emailAddress || ''}
        isEditable={true}
        isSelfProfile={true}
      />
    </div>
  );
}; 