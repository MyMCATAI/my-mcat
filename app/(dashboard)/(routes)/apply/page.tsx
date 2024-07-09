import React from 'react';
import { Play } from 'lucide-react';

const ApplyPage = () => {
  return (
    <div className="bg-[#001326] min-h-screen p-8 text-white flex justify-center">
      <div className="max-w-screen-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Practice Tests</h1>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="relative aspect-video mb-4">
            <div className="absolute inset-0 bg-gray-600 rounded-lg flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Play className="text-white w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <TestButton title="Karki's Diagnostic Exam" />
          <TestButton title="AAMC Unscored Sample" />
        </div>
      </div>
    </div>
  );
};

interface TestButtonProps {
    title: string;
  }
const TestButton: React.FC<TestButtonProps> = ({ title }) => (
    <button className="w-full bg-[#0A2744] hover:bg-[#0A2744]/80 transition-colors duration-200 py-3 px-4 rounded-lg flex items-center space-x-2">
    <div className="flex-shrink-0 flex space-x-2">
      <span className="block w-4 h-4 bg-white/20 rounded-sm"></span>
      <span className="block w-4 h-4 bg-white/20 rounded-sm"></span>
      <span className="block w-4 h-4 bg-white/20 rounded-sm"></span>
    </div>
    <span className="flex-grow text-left">{title}</span>
  </button>
);

export default ApplyPage;