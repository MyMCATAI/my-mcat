import React, { useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UserInfo } from "@/hooks/useUserInfo";

interface RedeemReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinsEarned?: number;
}

const RedeemReferralModal: React.FC<RedeemReferralModalProps> = ({
  isOpen,
  onClose,
  coinsEarned = 10,
}) => {
  const handleConfirm = async () => {
    try {
      // Save to localStorage to prevent showing modal again
      localStorage.setItem('mymcat_show_redeem_referral_modal', 'false');
      onClose();
    } catch (error) {
      console.error('Error redeeming referral:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-2 border-[--theme-border-color] sm:max-w-[425px]">
        <div className="text-center">
          <div className="h-[53px] overflow-hidden mb-4">
            <Image
              src="/gleamingcoin.gif"
              alt="Coin"
              width={100}
              height={53}
              sizes="100px"
              className="object-cover translate-y-[-22.5%] mx-auto"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-[--theme-text-color]">
            Referral Bonus!
          </h3>
          <p className="text-sm text-[--theme-text-color] mb-4">
            {`You've earned ${coinsEarned} coins from your referral!`}
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleConfirm}
              className="bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] hover:bg-[--theme-hover-color]"
            >
              Claim Reward
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemReferralModal;