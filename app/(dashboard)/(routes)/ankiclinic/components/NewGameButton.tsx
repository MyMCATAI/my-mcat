import { useState, useEffect } from "react";
import Image from "next/image";
import { FC } from "react";
import { toast } from "react-hot-toast";
import { useUserInfo } from "@/hooks/useUserInfo";

interface NewGameButtonProps {
  userScore: number;
  onGameStart: (userTestId: string) => void;
  isGameInProgress: boolean;
  resetGameState: () => void;
  isMobileBottom?: boolean;
}

const NewGameButton: FC<NewGameButtonProps> = ({ 
  userScore, 
  onGameStart,
  isGameInProgress,
  resetGameState,
  isMobileBottom = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
  const { decrementScore } = useUserInfo();

  // Check if the screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsVerySmallScreen(window.innerWidth < 480);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
      toast.error("You need 1 coin to start a new game!");
      return;
    }

    try {
      setIsLoading(true);
      
      await decrementScore();
      
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isGameInProgress) {
      setIsLoading(false);
    }
  }, [isGameInProgress]);

  return (
    <div className={`hover:-translate-y-0.5 ${isMobile ? 'w-full' : ''}`}>
      <button
        onClick={handleNewGame}
        disabled={isGameInProgress || isLoading}
        className={`border-2 border-[--theme-border-color] 
          ${isMobile ? 'px-4 py-3 text-base w-full' : 'px-6 py-3 text-lg'} 
          rounded-lg transition-all duration-300 
          shadow-lg hover:shadow-xl transform
          font-bold flex items-center justify-center gap-2
          opacity-90 hover:opacity-100
          ${isMobile ? 'bg-green-500 text-white' : ''}
          ${isGameInProgress 
            ? 'cursor-not-allowed opacity-50 hover:transform-none hover:shadow-lg bg-transparent' 
            : 'hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] text-[--theme-hover-text] animate-pulse [animation-duration:0.75s] bg-green-500/20'
          }`}
      >
        <span className={`text-[--theme-hover-text] border-r border-[--theme-border-color] ${!isGameInProgress && 'hover:border-white/30'} pr-2`}>
          {isGameInProgress && (isVerySmallScreen ? 'Game' : isMobile ? 'In Progress' : 'Game in Progress') || 
           isLoading && (isVerySmallScreen ? 'Load' : isMobile ? 'Loading...' : 'Loading Game...') || 
           (isVerySmallScreen ? 'New Game' : isMobile ? 'New Game' : 'New Game')}
        </span>
        <span className="text-[--theme-hover-text]">
          {isGameInProgress || isLoading ? '' : '-1'}
        </span>
        <Image
          src="/game-components/PixelCupcake.png"
          alt="Coin"
          width={isMobile ? 24 : 24}
          height={isMobile ? 24 : 24}
          className="inline-block"
        />
      </button>
    </div>
  );
};

export default NewGameButton;