import React from 'react';
import AAMC from './AAMC';
import FLSpecific from './FLSpecific';

interface TestComponentProps {
  showList?: boolean;
  userPrompt?: string;
  generatedPassage?: string;
  setGeneratedPassage?: (passage: string) => void;
  generatedExplanation?: string;
  setGeneratedExplanation?: (explanation: string) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ showList }) => {
  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-gray-600 rounded-lg overflow-hidden p-2">
      {/* Container for content */}
      <div className="flex flex-col md:flex-row w-full h-full bg-[#FFFDF3] rounded-lg overflow-hidden">
        {/* Left Side */}
        <div className="w-full md:w-[calc(50%-1px)] h-1/2 md:h-full overflow-y-auto border-b md:border-b-0 md:border-r border-gray-300 p-2">
          <AAMC />
        </div>
        {/* Right Side */}
        <div className="w-full md:w-[calc(50%-1px)] h-1/2 md:h-full overflow-y-auto p-2">
          <FLSpecific />
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
