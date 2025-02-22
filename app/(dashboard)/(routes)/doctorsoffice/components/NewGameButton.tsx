import { useState, useEffect } from "react";
import Image from "next/image";
import { FC } from "react";
import { toast } from "react-hot-toast";
import FeedbackModal from "./FeedbackModal";
import { PurchaseButton } from "@/components/purchase-button";

interface NewGameButtonProps {
  userScore: number;
  setUserScore: (score: number) => void;
  onGameStart: (userTestId: string) => void;
  isGameInProgress: boolean;
  resetGameState: () => void;
}

const NewGameButton: FC<NewGameButtonProps> = ({ 
  userScore, 
  setUserScore, 
  onGameStart,
  isGameInProgress,
  resetGameState
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const createNewUserTest = async () => {
    try {
      const response = await fetch("/api/user-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create user test");
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Error creating user test:", error);
      toast.error("Failed to start challenge");
      return null;
    }
  };

  const handleNewGame = async () => {
    if (userScore < 1) {
      const feedbackSubmitted = localStorage.getItem('feedbackSubmitted');
      if (feedbackSubmitted === 'false' || feedbackSubmitted === null) {
        setIsFeedbackModalOpen(true);
        return;
      } else {
        setIsPurchaseModalOpen(true);
        return;
      }
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/user-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          decrementScore: 1
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to deduct coin");
      }

      const { score: updatedScore } = await response.json();
      setUserScore(updatedScore);

      resetGameState();

      const userTestId = await createNewUserTest();
      if (userTestId) {
        onGameStart(userTestId);
        toast.success("New game started! 1 coin deducted.");
      } else {
        console.error("Failed to create new user test");
        toast.error("Failed to start new game. Please try again.");
      }
    } catch (error) {
      console.error("Error starting new game:", error);
      toast.error("Failed to start new game. Please try again.");
    }
  };

  useEffect(() => {
    if (isGameInProgress) {
      setIsLoading(false);
    }
  }, [isGameInProgress]);

  return (
    <div className="hover:-translate-y-0.5">
      <button
        onClick={handleNewGame}
        disabled={isGameInProgress || isLoading}
        className={`border-2 border-[--theme-border-color] 
          px-6 py-3 rounded-lg transition-all duration-300 
          shadow-lg hover:shadow-xl transform
          font-bold text-lg flex items-center gap-2
          opacity-90 hover:opacity-100
          ${isGameInProgress 
            ? 'cursor-not-allowed opacity-50 hover:transform-none hover:shadow-lg bg-transparent' 
            : 'hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] text-[--theme-hover-text] animate-pulse [animation-duration:0.75s] bg-green-500/20'
          }`}
      >
        <span className={`text-[--theme-hover-text] border-r border-[--theme-border-color] ${!isGameInProgress && 'hover:border-white/30'} pr-2`}>
          {isGameInProgress && 'Game in Progress' || isLoading && 'Loading Game...' || 'New Game'}
        </span>
        <span className="text-[--theme-hover-text]">
          {isGameInProgress || isLoading ? '' : '-1'}
        </span>
        <Image
          src="/game-components/PixelCupcake.png"
          alt="Coin"
          width={24}
          height={24}
          className="inline-block"
        />
      </button>
      {isPurchaseModalOpen && (
        <PurchaseButton 
        autoOpen={true}
          userCoinCount={userScore}
          text=""
          className=""
          tooltipText = ""
          onClose={() => setIsPurchaseModalOpen(false)}
        >
                  </PurchaseButton>
      )}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        setUserScore={setUserScore}
      />
    </div>
  );
};

export default NewGameButton;