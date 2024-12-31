import { Dialog, DialogContent, DialogOverlay } from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { PurchaseButton } from "@/components/purchase-button";
import Image from "next/image";

interface GameOverDialogProps {
  userCoinCount: number;
}

export const GameOverDialog: React.FC<GameOverDialogProps> = ({ userCoinCount }) => {
  return (
    <Dialog open={true}>
      <DialogOverlay 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]" 
      />
      <DialogContent 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        bg-[--theme-leaguecard-color] p-8 rounded-lg shadow-xl max-w-md w-full z-[101]
        border-2 border-[--theme-border-color]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative w-32 h-32 mb-4">
            <Image
              src="/game-components/CupcakeCoin.gif"
              alt="Empty Coin"
              layout="fill"
              objectFit="contain"
              className="opacity-50"
            />
          </div>

          <motion.h2 
            className="text-4xl font-bold text-[--theme-text-color]"
            animate={{ 
              scale: [1, 1.2, 1],
              color: ['#ff0000', '#ffffff', '#ff0000'] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            GAME OVER!
          </motion.h2>
          
          <p className="text-center text-[--theme-text-color] text-lg">
            You've run out of coins! Purchase more to continue your MCAT journey.
          </p>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <PurchaseButton 
              text="Purchase More Coins"
              className="w-full py-4 text-lg font-bold bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] text-[--theme-text-color]"
              tooltipText="Purchase coins to continue your journey"
              showMDPremium={true}
              userCoinCount={userCoinCount}
            />
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}; 