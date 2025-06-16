import { useState, useEffect } from "react";
import Image from "next/image";
import { FC } from "react";
import { toast } from "react-hot-toast";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useUser, useGame } from "@/store/selectors";


interface NewGameButtonProps {
  onGameStart: (userTestId: string) => void;
}

const NewGameButton: FC<NewGameButtonProps> = ({ 
  onGameStart
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const { decrementScore } = useUserInfo();
  // Get user state from Zustand store
  const { coins: userScore } = useUser();
  // Get game state from Zustand store
  const { isGameInProgress, resetGameState } = useGame();

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
      setShowPurchaseDialog(true);
      return;
    }

    try {
      setIsLoading(true);
      
      await decrementScore();
      
      resetGameState();

      const userTestId = await createNewUserTest();
      if (userTestId) {
        onGameStart(userTestId);
      } else {
        console.error("Failed to create new user test");
        toast.error("Failed to start new game. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error starting new game:", error);
      toast.error("Failed to start new game. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isGameInProgress) {
      setIsLoading(false);
    }
  }, [isGameInProgress]);

  // Effect to close purchase dialog when user gains coins
  useEffect(() => {
    if (showPurchaseDialog && userScore >= 1) {
      const timer = setTimeout(() => {
        setShowPurchaseDialog(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userScore, showPurchaseDialog]);

  return (
    <div className="hover:-translate-y-0.5">
      <button
        onClick={handleNewGame}
        disabled={isGameInProgress || isLoading}
        className={`border-2 border-[--theme-border-color] 
          px-6 py-3 rounded-lg transition-all duration-300 
          shadow-lg hover:shadow-xl transform
          font-bold text-lg flex items-center gap-2
          opacity-100
          ${isGameInProgress 
            ? 'cursor-not-allowed opacity-50 hover:transform-none hover:shadow-lg bg-transparent' 
            : 'hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] text-[--theme-hover-text] animate-pulse [animation-duration:0.75s] bg-green-500'
          }`}
      >
        <span className={`text-[--theme-hover-text] border-r border-[--theme-border-color] ${!isGameInProgress && 'hover:border-white/30'} pr-2`}>
          {isGameInProgress ? 'Game in Progress' : isLoading ? 'Loading Game...' : 'New Game'}
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


    </div>
  );
};

export default NewGameButton;