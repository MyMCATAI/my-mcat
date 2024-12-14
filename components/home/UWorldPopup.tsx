import React, { useState, useEffect } from 'react';
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

interface DataPulse {
  id: string;
  name: string;
  positive: number;
  negative: number;
  createdAt: string;
}

const UWorldPopup: React.FC<UWorldPopupProps> = ({
  isOpen,
  onClose,
  tasks,
  onScoreSubmit,
}) => {
  const [correctAnswers, setCorrectAnswers] = useState<number[]>(new Array(tasks.length).fill(0));
  const [incorrectAnswers, setIncorrectAnswers] = useState<number[]>(new Array(tasks.length).fill(0));
  const [recentPulses, setRecentPulses] = useState<DataPulse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateScore = (correct: number, incorrect: number) => {
    const total = correct + incorrect;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  useEffect(() => {
    const fetchRecentPulses = async () => {
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const response = await fetch(`/api/data-pulse?source=UWorld`);
        if (!response.ok) {
          throw new Error('Failed to fetch recent pulses');
        }

        const pulses: DataPulse[] = await response.json();
        
        const recentPulses = pulses.filter(pulse => 
          new Date(pulse.createdAt) > yesterday
        );

        setRecentPulses(recentPulses);

        const newCorrect = [...correctAnswers];
        const newIncorrect = [...incorrectAnswers];

        tasks.forEach((task, index) => {
          const matchingPulse = recentPulses.find(p => p.name === task.subject);
          if (matchingPulse) {
            newCorrect[index] = matchingPulse.positive;
            newIncorrect[index] = matchingPulse.negative;
          }
        });

        setCorrectAnswers(newCorrect);
        setIncorrectAnswers(newIncorrect);
      } catch (error) {
        console.error('Error fetching recent pulses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchRecentPulses();
    }
  }, [isOpen]);

  const handleCorrectAnswersChange = (index: number, value: string) => {
    const newCorrect = Math.max(0, parseInt(value) || 0);
    const newCorrectAnswers = [...correctAnswers];
    newCorrectAnswers[index] = newCorrect;
    setCorrectAnswers(newCorrectAnswers);
  };

  const handleIncorrectAnswersChange = (index: number, value: string) => {
    const newIncorrect = Math.max(0, parseInt(value) || 0);
    const newIncorrectAnswers = [...incorrectAnswers];
    newIncorrectAnswers[index] = newIncorrect;
    setIncorrectAnswers(newIncorrectAnswers);
  };

  const handleSubmit = async () => {
    try {
      const createPromises = tasks.map(async (task, index) => {
        const positive = correctAnswers[index] || 0;
        const negative = incorrectAnswers[index] || 0;

        const dataPulse = {
          name: task.subject,
          positive,
          negative,
          level: "contentCategory",
          source: "UWorld",
          notes: "",
          weight: 1,
        };

        const response = await fetch('/api/data-pulse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataPulse),
        });

        if (!response.ok) {
          throw new Error(`Failed to create DataPulse for ${task.subject}`);
        }

        return response.json();
      });

      await Promise.all(createPromises);
      const calculatedScores = correctAnswers.map((correct, index) => 
        calculateScore(correct || 0, incorrectAnswers[index] || 0)
      );
      onScoreSubmit(calculatedScores);
      onClose();
    } catch (error) {
      console.error('Error submitting scores:', error);
    }
  };

  const calculateAverageScore = () => {
    const scores = correctAnswers.map((correct, index) => 
      calculateScore(correct, incorrectAnswers[index])
    );
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / scores.length);
  };

  const isScoreReadOnly = (taskSubject: string) => {
    return recentPulses.some(pulse => pulse.name === taskSubject);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[40rem] bg-[#f8fafc] text-black">
        <DialogHeader>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-black">
                UWorld
              </DialogTitle>
              <a 
                href="https://www.uworld.com/app/index.html#/login/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-all shadow-sm hover:shadow-md"
              >
                <span>Visit</span>
                <span className="text-[0.625rem] text-gray-500">*</span>
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
            <div className="text-[0.7rem] text-gray-400 italic">
              Our study tool is unaffiliated with UWorld
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col space-y-12">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="space-y-8">
              {tasks.map((task, index) => (
                <div 
                  key={index}
                  className="bg-[#8e9aab] bg-opacity-10 p-6 rounded-lg border border-[#e5e7eb] shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-grow">
                      <p className="text-black font-medium text-lg">{task.subject}</p>
                      <p className="text-sm text-gray-600">{task.text}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-green-700 font-medium">Correct</span>
                        <Input
                          type="number"
                          min="0"
                          value={correctAnswers[index]}
                          onChange={(e) => handleCorrectAnswersChange(index, e.target.value)}
                          className="w-24 text-center bg-green-50 border-green-400 focus:border-green-600 focus:ring-green-600 text-green-800 font-medium"
                          placeholder="0"
                          disabled={isScoreReadOnly(task.subject)}
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-red-700 font-medium">Incorrect</span>
                        <Input
                          type="number"
                          min="0"
                          value={incorrectAnswers[index]}
                          onChange={(e) => handleIncorrectAnswersChange(index, e.target.value)}
                          className="w-24 text-center bg-red-50 border-red-400 focus:border-red-600 focus:ring-red-600 text-red-800 font-medium"
                          placeholder="0"
                          disabled={isScoreReadOnly(task.subject)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full mt-3">
                    <div 
                      className="absolute h-full bg-blue-300 rounded-full transition-all duration-300"
                      style={{ width: `${calculateScore(correctAnswers[index], incorrectAnswers[index])}%` }}
                    />
                  </div>
                  {isScoreReadOnly(task.subject) && (
                    <div className="mt-2 text-xs text-gray-500">
                      {"Score from today's previous attempt"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-gray-600 hover:text-gray-900 transition"
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