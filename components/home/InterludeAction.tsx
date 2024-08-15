import { FetchedActivity } from "@/types";

// New InterludeAction component
interface InterludeActionProps {
    activities: FetchedActivity[];
    onActionClick: () => void;
    onSkip: () => void;
  }
  
  export const InterludeAction: React.FC<InterludeActionProps> = ({ activities, onActionClick, onSkip }) => {
    const buttonText = activities.length === 0
      ? "Enter information on your calendar!"
      : ">> I'm ready to begin!";

  
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
        <button 
          onClick={onActionClick}
          className="px-6 py-3 text-green-300 font-mono shadow-lg transition-all duration-600 ease-in-out hover:text-blue-600 transition-colors animate-pulse cursor-pointer"
          style={{
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}
        >
          {buttonText}
        </button>
        <button 
          onClick={onSkip}
          className="mt-4 text-blue-200 font-mono text-lg hover:text-blue-600 transition-colors"
        >
        </button>
      </div>
    );
  };
  