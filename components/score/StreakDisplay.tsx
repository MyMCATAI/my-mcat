import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaFire } from "react-icons/fa";

interface StreakDisplayProps {
  streak: number;
}

const StreakDisplay = ({ streak }: StreakDisplayProps) => {
  return (
    <div 
      className="flex justify-end items-center gap-2 rounded-2xl px-4 py-2 transition-all duration-200"
      style={{
        backgroundColor: 'var(--theme-leaguecard-color)',
      }}
    >
      <span 
        className="font-bold text-2xl" 
        style={{ color: 'var(--theme-text-color)' }}
      >
        {streak}
      </span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="relative mr-2 ml-2">
              <FaFire 
                className="text-yellow-300 text-2xl transform hover:scale-110 transition-transform duration-200" 
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{`You have a streak of ${streak} days!`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default StreakDisplay;