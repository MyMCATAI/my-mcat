import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogOverlay } from "@radix-ui/react-dialog";
import { PurchaseButton } from "@/components/purchase-button";

interface PurchaseCoinsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PurchaseCoinsModal = ({ open, onOpenChange }: PurchaseCoinsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-80 z-50" />
      <DialogContent className="bg-[#001226] text-white border border-sky-500 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-sky-300">
            {"Welcome to MCAT Pro!"}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {"To get started with your MCAT preparation journey, you'll need to purchase coins. These coins will unlock all the features and help you track your progress."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="text-center text-gray-300">
            {"Get access to personalized study plans, adaptive tutoring, and more!"}
          </p>
          <PurchaseButton 
            text={"Get Started with Coins"}
            className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-2"
            tooltipText={"Purchase coins to begin your MCAT journey"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseCoinsModal;