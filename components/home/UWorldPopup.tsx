import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UWorldTask {
  text: string;
  completed: boolean;
  subject: string;
}

interface UWorldPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: UWorldTask[];
  onScoreSubmit: (scores: number[]) => void;
}

const UWorldPopup: React.FC<UWorldPopupProps> = ({
  isOpen,
  onClose,
  tasks,
  onScoreSubmit,
}) => {
  const [scores, setScores] = useState<number[]>(new Array(tasks.length).fill(0));
  const [questions, setQuestions] = useState<number[]>(new Array(tasks.length).fill(0));

  const handleScoreChange = (index: number, value: string) => {
    const newScore = Math.min(100, Math.max(0, parseInt(value) || 0));
    const newScores = [...scores];
    newScores[index] = newScore;
    setScores(newScores);
  };

  const handleQuestionsChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = parseInt(value) || 0;
    setQuestions(newQuestions);
  };

  const handleSubmit = () => {
    onScoreSubmit(scores);
    onClose();
  };

  const calculateAverageScore = () => {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / scores.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[40rem] bg-[#152c69] text-white" closeButtonClassName="hidden">
        <DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-white">
                UWorld
              </DialogTitle>
              <a 
                href="https://www.uworld.com/app/index.html?srsltid=AfmBOooIWaD-Q3kqMxNO_ffk2cazgN6SHu5fMXnfyXFAOErFGxI5W9Lw#/login/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <span>Visit</span>
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                  />
                </svg>
              </a>
            </div>
            <div className="text-xs text-[#307af4] italic">
              *This tool is not affiliated with or endorsed by UWorld
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col space-y-6">
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div 
                key={index}
                className="bg-[#1e3a8a] p-4 rounded-lg border border-[#234097]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-grow">
                    <p className="text-white font-medium">{task.subject}</p>
                    <p className="text-sm text-gray-300">{task.text}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        value={questions[index]}
                        onChange={(e) => handleQuestionsChange(index, e.target.value)}
                        className="w-20 text-center bg-white text-black"
                        placeholder="Questions"
                      />
                      <span className="text-gray-300 text-sm">Qs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[index]}
                        onChange={(e) => handleScoreChange(index, e.target.value)}
                        className="w-20 text-center bg-white text-black"
                        placeholder="Score"
                      />
                      <span className="text-gray-300">%</span>
                    </div>
                  </div>
                </div>
                <div className="relative h-2 bg-[#234097] rounded-full mt-3">
                  <div 
                    className="absolute h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${scores[index]}%` }}
                  />
                  {scores[index] > 0 && (
                    <div 
                      className="absolute -top-1.5 text-xs font-medium text-white"
                      style={{ 
                        left: `${scores[index]}%`, 
                        transform: 'translateX(-50%)'
                      }}
                    >
                      {scores[index]}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#2c4ba3] pt-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Overall Progress</h3>
            <div className="relative h-8 bg-[#2c4ba3] rounded-full">
              <div 
                className="absolute h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${calculateAverageScore()}%` }}
              />
              {calculateAverageScore() > 0 && (
                <div 
                  className="absolute -top-6 text-base font-medium text-white"
                  style={{ 
                    left: `${calculateAverageScore()}%`, 
                    transform: 'translateX(-50%)'
                  }}
                >
                  {calculateAverageScore()}%
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-gray-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Submit Scores
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UWorldPopup; 