import React, { useState } from 'react';
import Image from 'next/image';
import { PROFILE_PHOTOS } from '@/hooks/useUserProfile';
import { createPortal } from 'react-dom';

interface PhotoSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (photoName: string) => void;
  currentPhoto?: string;
}

const PhotoSelectionModal: React.FC<PhotoSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentPhoto
}) => {
  const [selectedPhoto, setSelectedPhoto] = React.useState<string | null>(null);
  const [hoverAnimations, setHoverAnimations] = React.useState<{ [key: string]: string }>({});
  const [isClosing, setIsClosing] = useState(false);

  // Array of possible hover animations
  const animations = [
    'hover:scale-110',
    'hover:rotate-6 hover:scale-105',
    'hover:-rotate-6 hover:scale-105',
    'hover:scale-105 hover:translate-y-[-4px]',
    'hover:rotate-[360deg] hover:scale-105'
  ];

  const getRandomAnimation = () => {
    const index = Math.floor(Math.random() * animations.length);
    return animations[index];
  };

  const handleMouseEnter = (photo: string) => {
    setHoverAnimations(prev => ({
      ...prev,
      [photo]: getRandomAnimation()
    }));
  };

  const handleSave = () => {
    if (selectedPhoto) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        onSelect(selectedPhoto);
        onClose();
      }, 300);
    }
  };

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[101]">
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
        <div 
          className="transition-[max-height,opacity] duration-300 ease-in-out overflow-visible"
          style={{ 
            maxHeight: isClosing ? '0px' : '800px',
            opacity: isClosing ? '0' : '1'
          }}
        >
          <h2 className="text-xl font-medium text-[--theme-text-color] mb-4">
            Choose your profile photo
          </h2>
          
          <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 overflow-visible p-2">
            {PROFILE_PHOTOS.map((photo, index) => (
              <div key={photo} className="overflow-visible">
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  onMouseEnter={() => handleMouseEnter(photo)}
                  className={`
                    relative rounded-full overflow-hidden w-full
                    ${(selectedPhoto || currentPhoto) === photo ? 'ring-2 ring-[--theme-hover-color]' : ''}
                    transition-all duration-500 ease-out transform
                    ${hoverAnimations[photo] || ''}
                  `}
                >
                  <Image
                    src={`/profile-photo/${photo}`}
                    alt={`Profile ${index + 1}`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                    quality={100}
                    priority={index < 8}
                  />
                  <div className="absolute inset-0 bg-[--theme-hover-color]/0 hover:bg-[--theme-hover-color]/10 transition-colors duration-300" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-[--theme-text-color] hover:text-[--theme-hover-color]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedPhoto}
              className={`
                px-4 py-2 rounded-lg text-white
                ${selectedPhoto 
                  ? 'bg-[--theme-hover-color] hover:bg-[--theme-hover-color]/90' 
                  : 'bg-gray-400 cursor-not-allowed'}
                transition-colors
              `}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PhotoSelectionModal; 