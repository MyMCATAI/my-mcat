import { Dialog, DialogContent, DialogOverlay } from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { PurchaseButton } from "@/components/purchase-button";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GiWallet } from 'react-icons/gi';

interface GameOverDialogProps {
  userCoinCount: number;
}

export const GameOverDialog: React.FC<GameOverDialogProps> = ({ userCoinCount }) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  return (
    <Dialog open={true}>
      <DialogOverlay 
        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100]" 
      />
      <DialogContent 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        bg-black/95 p-8 rounded-lg shadow-xl max-w-md w-full z-[101]
        border-2 border-transparent"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div 
            className="text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <h1 className="text-7xl font-bold text-red-500">
              UH OH!
            </h1>
          </motion.div>

          <p className="text-center text-white text-lg">
            {"You ran out of coins. We believe that you can do better. Want to try again?"}
          </p>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <PurchaseButton 
              text="Purchase More Coins"
              className="w-full py-4 text-lg font-bold bg-red-500 hover:bg-red-600 text-white"
              tooltipText="Purchase coins to continue your journey"
              showMDPremium={true}
              userCoinCount={userCoinCount}
              autoOpen={showPurchaseModal}
            >
              <Button 
                onClick={() => setShowPurchaseModal(true)}
                className="w-full py-4 text-lg font-bold bg-red-500 hover:bg-red-600 text-white"
              >
                Purchase More Coins
              </Button>
            </PurchaseButton>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}; 