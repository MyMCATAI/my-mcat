import { Button } from "@/components/ui/button";
import { PurchaseButton } from "@/components/purchase-button";
import { Coins } from "lucide-react";
import { PENALTY_COSTS } from "@/lib/coin/constants";

interface QuizIntroDialogProps {
  category: string;
  userScore: number;
  isStarting: boolean;
  onStart: () => void;
}

export function QuizIntroDialog({
  category,
  userScore,
  isStarting,
  onStart,
}: QuizIntroDialogProps) {
  const quizCost = Math.abs(PENALTY_COSTS.START_ATS_QUIZ);
  
  return (
    <div className="h-full flex items-center justify-center" >
      <div 
        className="bg-[--theme-leaguecard-color] border-[--theme-border-color] border rounded-lg p-6 max-w-[500px] w-full shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from dismissing
      >
        <div className="text-2xl font-bold text-center mb-4 text-[--theme-text-color]">
          Get ready for: {category} Quiz
        </div>

        <div className="space-y-4">
          <div className="bg-[--theme-gradient-end] p-4 rounded-lg space-y-2">
            <h3 className="font-semibold flex items-center gap-2 text-[--theme-text-color]">
              <Coins className="w-5 h-5" />
              Coin Information
            </h3>
            <p className="text-sm text-[--theme-text-color]">
              • Starting this quiz costs {quizCost} coin{quizCost !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-[--theme-text-color]">
              • Earn a coin for scoring 70% or higher
            </p>
            <p className="text-sm text-[--theme-text-color]">
              • Earn two coins for scoring 100%
            </p>
            <p className="text-sm text-[--theme-text-color]">
              • Each quiz has a new set of questions 
            </p>
            <p className="text-sm font-medium mt-2 text-[--theme-text-color]">
              Your current balance: {userScore} coins
            </p>
          </div>

          <div className="flex justify-center">
            {userScore >= quizCost ? (
              <Button
                onClick={onStart}
                disabled={isStarting}
                className="bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] text-[--theme-text-color] min-w-[200px]"
              >
                {isStarting ? "Starting..." : `Start Quiz (${quizCost} Coin${quizCost !== 1 ? 's' : ''})`}
              </Button>
            ) : (
              <div className="space-y-2 text-center">
                <p className="text-destructive text-sm">
                  {`You need at least ${quizCost} coin${quizCost !== 1 ? 's' : ''} to start this quiz`}
                </p>
                <PurchaseButton
                  text="Purchase Coins to Start"
                  className="bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] text-[--theme-text-color] min-w-[200px]"
                  tooltipText="Purchase coins to access this quiz"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}