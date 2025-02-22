import React, { useState, useEffect } from 'react';
import { CatIcon } from 'lucide-react';
import CoinModal from './CoinModal';

interface FriendMenuProps {
  friendId: string;
  friendName: string;
  friendCoins: number;
  selfCoins: number;
}

const FriendMenu = ({ friendId, friendName, friendCoins, selfCoins }: FriendMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [coinModalType, setCoinModalType] = useState<'send' | 'request'>('send');
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-[--theme-hover-color]/10 transition-colors"
        >
          <CatIcon className="w-5 h-5 text-[--theme-text-color]" />
        </button>

        <div 
          className={`
            absolute right-0 top-full mt-1 w-36 rounded-md overflow-hidden 
            bg-[--theme-mainbox-color] shadow-lg border border-[--theme-border-color]
            transition-all duration-200 origin-top z-50
            ${isOpen 
              ? 'transform scale-y-100 opacity-100' 
              : 'transform scale-y-0 opacity-0 pointer-events-none'
            }
          `}
        >
          <button
            onClick={() => {
              setCoinModalType('send');
              setShowCoinModal(true);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-[--theme-text-color] hover:bg-[--theme-hover-color]/10"
          >
            Send Coins
          </button>
          <button
            onClick={() => {
              setCoinModalType('request');
              setShowCoinModal(true);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-[--theme-text-color] hover:bg-[--theme-hover-color]/10"
          >
            Request Coins
          </button>
        </div>
      </div>

      {showCoinModal && (
        <CoinModal
          isOpen={showCoinModal}
          onClose={() => setShowCoinModal(false)}
          type={coinModalType}
          friendId={friendId}
          friendName={friendName}
          friendCoins={friendCoins}
        />
      )}
    </>
  );
};

export default FriendMenu; 