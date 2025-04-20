import { useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useUser, useGame } from "@/store/selectors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import SubjectFilter from "./SubjectFilter";

interface NewGameWithFilterProps {
  onGameStart: (userTestId: string) => void;
}

const NewGameWithFilter = ({ onGameStart }: NewGameWithFilterProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { decrementScore } = useUserInfo();
  const { coins: userScore } = useUser();
  const { isGameInProgress, resetGameState, selectedSubjects } = useGame();

  const createNewUserTest = async () => {
    try {
      const response = await fetch("/api/user-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          subjects: selectedSubjects 
        }),
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

  if (isGameInProgress) {
    return (
      <div className="hover:-translate-y-0.5">
        <button
          disabled
          className="border-2 border-[--theme-border-color] 
            px-6 py-3 rounded-lg transition-all duration-300 
            shadow-lg hover:shadow-xl font-bold text-lg flex items-center gap-2
            opacity-50 cursor-not-allowed bg-transparent"
        >
          <span className="text-[--theme-hover-text] border-r border-[--theme-border-color] pr-2">
            Game in Progress
          </span>
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="hover:-translate-y-0.5">
        <button
          disabled
          className="border-2 border-[--theme-border-color] 
            px-6 py-3 rounded-lg transition-all duration-300 
            shadow-lg hover:shadow-xl font-bold text-lg flex items-center gap-2"
        >
          <span className="text-[--theme-hover-text] border-r border-[--theme-border-color] pr-2">
            Loading Game...
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
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full h-12 w-12 bg-[--theme-gradient-startstreak] border-2 border-[--theme-border-color]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[300px]">
          <DialogHeader>
            <DialogTitle>Game Subject Filters</DialogTitle>
          </DialogHeader>
          <div className="p-2">
            <p className="text-sm text-gray-500 mb-4">
              Choose which subjects to focus on in your next game:
            </p>
            
            <SubjectFilter onFilterApplied={() => setShowFilters(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <button
        onClick={handleNewGame}
        className="border-2 border-[--theme-border-color] 
          px-6 py-3 rounded-lg transition-all duration-300 
          shadow-lg hover:shadow-xl transform
          font-bold text-lg flex items-center gap-2
          opacity-100 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
          text-[--theme-hover-text] animate-pulse [animation-duration:0.75s] bg-green-500"
      >
        <span className="text-[--theme-hover-text] border-r border-[--theme-border-color] hover:border-white/30 pr-2">
          New Game ({selectedSubjects.length} Subjects)
        </span>
        <span className="text-[--theme-hover-text]">
          -1
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

export default NewGameWithFilter; 