import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useUserStats } from '@/contexts/UserStatsContext';

interface CoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'send' | 'request';
  friendId: string;
  friendName: string;
  friendCoins: number;  // Add this prop for friend's balance
}

const CoinModal = ({ isOpen, onClose, type, friendId, friendName, friendCoins }: CoinModalProps) => {
  const { coins, updateCoinsDisplay } = useUserStats();
  const [amount, setAmount] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  // Use coins from context for send, friendCoins for request
  const currentMaxAmount = type === 'send' ? coins : friendCoins;

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleSubmit = async () => {
    const numAmount = parseInt(amount);
    if (numAmount > 0 && numAmount <= currentMaxAmount) {
      setIsSubmitting(true);
      try {
        // Optimistically update display
        if (type === 'send') {
          updateCoinsDisplay(coins - numAmount);
        }

        const response = await fetch('/api/coin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: type,
            toUserId: friendId,
            amount: numAmount 
          })
        });

        if (!response.ok) {
          // Revert optimistic update on error
          if (type === 'send') {
            updateCoinsDisplay(coins);
          }
          const error = await response.text();
          throw new Error(error);
        }

        setResultMessage(
          type === 'send' 
            ? `Sent ${numAmount} coins to ${friendName}!`
            : `Requested ${numAmount} coins from ${friendName}!`
        );
        setShowSuccess(true);
        
        setTimeout(() => {
          setAmount('');
          handleClose();
        }, 2000);
      } catch (error) {
        setResultMessage(
          type === 'send'
            ? `Failed to send coins to ${friendName}`
            : `Failed to request coins from ${friendName}`
        );
        setShowFailure(true);
        setTimeout(() => {
          setShowFailure(false);
        }, 2000);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="absolute inset-0" onClick={handleClose} />
      <AnimatePresence>
        {showSuccess ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-[--theme-mainbox-color] p-8 rounded-xl flex flex-col items-center gap-4 relative z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, times: [0, 0.5, 1] }}
              className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center"
            >
              <Check className="w-6 h-6 text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[--theme-text-color] text-center"
            >
              {resultMessage}
            </motion.p>
          </motion.div>
        ) : showFailure ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-[--theme-mainbox-color] p-8 rounded-xl flex flex-col items-center gap-4 relative z-10"
          >
            <motion.div
              animate={{ x: [-10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[--theme-text-color] text-center"
            >
              {resultMessage}
            </motion.p>
          </motion.div>
        ) : (
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
                {type === 'send' ? `Send Coins to ${friendName}` : `Request Coins from ${friendName}`}
              </h3>
              
              <input
                type="number"
                min="1"
                max={currentMaxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                className="w-full p-3 rounded-lg bg-[--theme-botchatbox-color] text-[--theme-text-color] 
                         border border-[--theme-border-color] focus:outline-none 
                         focus:ring-2 focus:ring-[--theme-hover-color] mb-4
                         disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter amount"
              />
              
              <div className="text-sm text-[--theme-text-color] mb-4">
                Maximum: {currentMaxAmount} coins
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-[--theme-text-color]/90 
                           hover:text-[--theme-text-color] transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!amount || parseInt(amount) > currentMaxAmount || parseInt(amount) < 1 || isSubmitting}
                  className={`
                    px-4 py-2 rounded-lg font-medium
                    bg-[--theme-hover-color] text-white
                    transition-all duration-300 ease-out
                    hover:bg-[--theme-hover-color]/90
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isSubmitting ? 'relative pl-8' : ''}
                  `}
                >
                  {isSubmitting && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    </div>
                  )}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default CoinModal; 