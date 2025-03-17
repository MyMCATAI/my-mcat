import { useState, useEffect } from "react";
import Image from "next/image";
import { FC } from "react";
import { toast } from "react-hot-toast";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useUser, useGame } from "@/store/selectors";
import { PENALTY_COSTS } from '@/lib/coin/constants';
import dynamic from 'next/dynamic';

const SkipGameDialog = dynamic(() => import('./SkipGameDialog'), {
  ssr: false
});

interface NewGameButtonProps {
  onGameStart: (userTestId: string) => void;
  onAfterTestDialogOpen: (open: boolean) => void;
}

const NewGameButton: FC<NewGameButtonProps> = ({ 
  onGameStart,
  onAfterTestDialogOpen
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const { userInfo } = useUserInfo();
  // Get user state from Zustand store
  const { coins: userScore } = useUser();
  // Get game state from Zustand store
  const { isGameInProgress, resetGameState, setCorrectCount, setWrongCount, setUserResponses, setCompleteAllRoom, startGame } = useGame();

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
    const cost = Math.abs(PENALTY_COSTS.START_ANKI_CLINIC);
    if (userScore < cost) {
      toast.error(`You need ${cost} coins to start a new game!`);
      return;
    }

    // Check if skip feature is enabled
    if (process.env.NEXT_PUBLIC_ANKI_SKIP === 'true') {
      setShowSkipDialog(true);
      return;
    }

    try {
      setIsLoading(true);
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

  const handleSkipConfirm = async (correct: number, total: number) => {
    try {
      setIsLoading(true);
      resetGameState();

      const userTestId = await createNewUserTest();
      if (!userTestId) {
        throw new Error("Failed to create new user test");
      }

      // Create dummy responses for the AfterTestFeed with proper formatting
      const dummyResponses = Array(total).fill(null).map((_, index) => ({
        id: `dummy-${index}`,
        questionId: `dummy-${index}`,
        isCorrect: index < correct,
        answeredAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        question: {
          id: `dummy-${index}`,
          types: 'normal',
          questionContent: `Question ${index + 1}`,
          questionOptions: JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']),
          category: {
            id: 'dummy-category',
            subjectCategory: 'Test Subject',
            contentCategory: 'Test Content',
            conceptCategory: 'Test Concept',
            generalWeight: 1,
            section: 'Test Section',
            color: '#000000',
            icon: 'test-icon'
          }
        }
      }));
      
      // Update the test score in the backend
      const correctQuestionWeight = 1;
      const incorrectQuestionWeight = -0.5;
      let testScore = correct * correctQuestionWeight + (total - correct) * incorrectQuestionWeight;
      testScore = Math.max(testScore, 0);

      await fetch(`/api/user-test/${userTestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: testScore,
          finishedAt: new Date().toISOString(),
        }),
      });

      // Set game state in the correct order
      startGame(userTestId);
      setUserResponses(dummyResponses);
      setCorrectCount(correct);
      setWrongCount(total - correct);
      setCompleteAllRoom(true);

      // Wait for state updates to be processed before showing the feed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Open the feed
      onAfterTestDialogOpen(true);

    } catch (error) {
      toast.error("Failed to skip game. Please try again.");
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
    <>
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
            {isGameInProgress || isLoading ? '' : PENALTY_COSTS.START_ANKI_CLINIC}
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

      <SkipGameDialog
        open={showSkipDialog}
        onOpenChange={setShowSkipDialog}
        onConfirm={handleSkipConfirm}
      />
    </>
  );
};

export default NewGameButton;