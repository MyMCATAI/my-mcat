import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PurchaseButton } from "@/components/purchase-button";
import { toast } from "react-hot-toast";
import { Coins } from "lucide-react";
import { useRouter } from "next/navigation";

interface TestIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  testTitle: string;
  testDescription?: string;
  passageTitle?: string;
  userScore: number;
}

export function TestIntroModal({
  isOpen,
  onClose,
  testTitle,
  testDescription,
  passageTitle,
  userScore,
}: TestIntroModalProps) {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleStartTest = async () => {
    try {
      setIsStarting(true);
      
      const response = await fetch("/api/user-info/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: -1 }), // Spend 1 coin to start
      });

      if (!response.ok) {
        throw new Error("Failed to process coin payment");
      }

      toast.success("Test started! Good luck!");
      onClose();
    } catch (error) {
      console.error("Error starting test:", error);
      toast.error("Failed to start test. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] bg-[--theme-leaguecard-color] border-[--theme-border-color]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 text-[--theme-text-color]">
            Get ready for: {testTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {passageTitle && (
            <p className="text-[--theme-text-color] italic">
              {`${passageTitle}`}
            </p>
          )}
          
          {testDescription && (
            <p className="text-[--theme-text-color]">
              {testDescription}
            </p>
          )}

          <div className="bg-[--theme-gradient-end] p-4 rounded-lg space-y-2">
            <h3 className="font-semibold flex items-center gap-2 text-[--theme-text-color]">
              <Coins className="w-5 h-5" />
              Coin Information
            </h3>
            <p className="text-sm text-[--theme-text-color]">
              • Starting this test costs 1 coin
            </p>
            <p className="text-sm text-[--theme-text-color]">
              You can earn that coin back by achieving a 8/9 stars.
            </p>
            <p className="text-sm text-[--theme-text-color]">
              • Get 3 stars for highlighting, strikethrough, crossing out.
              • Get 3 stars for doing a passage in under 10 minutes.
              • Get 3 stars for getting 100% of them correct. 
            </p>
            <p className="text-sm font-medium mt-2 text-[--theme-text-color]">
              Your current balance: {userScore} coins
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button
              onClick={() => {
                router.push("/home?tab=CARS");
                onClose();
              }}
              variant="outline"
              className="border-[--theme-doctorsoffice-accent] text-[--theme-text-color] min-w-[200px]"
            >
              Return to Home
            </Button>
            {userScore >= 1 ? (
              <Button
                onClick={handleStartTest}
                disabled={isStarting}
                className="bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] text-[--theme-text-color] min-w-[200px]"
              >
                {isStarting ? "Starting..." : "Start Test (1 Coin)"}
              </Button>
            ) : (
              <div className="space-y-2 text-center">
                <p className="text-destructive text-sm">
                  {"You need at least 1 coin to start this test"}
                </p>
                <PurchaseButton 
                  text="Purchase Coins to Start"
                  className="bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] text-[--theme-text-color] min-w-[200px]"
                  tooltipText="Purchase coins to access this test"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 