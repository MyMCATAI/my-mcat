import { FetchedActivity } from "@/types";

// New InterludeAction component
interface InterludeActionProps {
    activities: FetchedActivity[];
    onActionClick: () => void;
    onSkip: () => void;
  }
  
  export const InterludeAction: React.FC<InterludeActionProps> = ({ activities, onActionClick, onSkip }) => {
    const buttonText = activities.length === 0
      ? "Would you like to enter information on your calendar?"
      : "Get studying!";
  
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
        <button 
          onClick={onActionClick}
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out hover:bg-green-600 hover:shadow-green-400/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
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
  