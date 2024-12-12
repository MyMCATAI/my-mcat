import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UWorldPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onScoreSubmit: (scores: number[]) => void;
}

interface DataPulse {
  id: string;
  name: string;
  level: string;
  weight: number;
  source: string;
  notes?: string;
  positive: number;
  negative: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const UWorldPopup: React.FC<UWorldPopupProps> = ({
  isOpen,
  onClose,
  onScoreSubmit,
}) => {

  const [dataPulses, setDataPulses] = useState<DataPulse[]>([]);
  const [newPulse, setNewPulse] = useState<Partial<DataPulse>>({
    name: '',
    level: 'conceptCategory',
    weight: 1,
    source: 'UWorld',
    notes: '',
    positive: 0,
    negative: 0
  });
  const [rightAnswers, setRightAnswers] = useState<number[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);

  useEffect(() => {
    fetchDataPulses();
  }, []);

  const fetchDataPulses = async () => {
    try {
      const response = await fetch('/api/data-pulse?source=UWorld');
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Expected array but received:', data);
        setDataPulses([]);
        setRightAnswers([]);
        setWrongAnswers([]);
        return;
      }
      
      setDataPulses(data);
      setRightAnswers(data.map((pulse: DataPulse) => pulse.positive || 0));
      setWrongAnswers(data.map((pulse: DataPulse) => pulse.negative || 0));
    } catch (error) {
      console.error('Error fetching data pulses:', error);
      setDataPulses([]);
      setRightAnswers([]);
      setWrongAnswers([]);
    }
  };

  const handleAddPulse = async () => {
    try {
      const response = await fetch('/api/data-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPulse),
      });
      
      if (response.ok) {
        await fetchDataPulses();
        setNewPulse({
          name: '',
          level: 'conceptCategory',
          weight: 1,
          source: 'UWorld',
          notes: '',
          positive: 0,
          negative: 0
        });
      }
    } catch (error) {
      console.error('Error adding pulse:', error);
    }
  };

  const handleRightAnswersChange = (index: number, value: string) => {
    const newRight = Math.max(0, parseInt(value) || 0);
    const newRightAnswers = [...rightAnswers];
    newRightAnswers[index] = newRight;
    setRightAnswers(newRightAnswers);
  };

  const handleWrongAnswersChange = (index: number, value: string) => {
    const newWrong = Math.max(0, parseInt(value) || 0);
    const newWrongAnswers = [...wrongAnswers];
    newWrongAnswers[index] = newWrong;
    setWrongAnswers(newWrongAnswers);
  };

  const calculateScore = (right: number, wrong: number) => {
    const total = right + wrong;
    if (total === 0) return 0;
    return Math.round((right / total) * 100);
  };

  const handleSubmit = () => {
    const calculatedScores = rightAnswers.map((right, index) => 
      calculateScore(right, wrongAnswers[index])
    );
    onScoreSubmit(calculatedScores);
    onClose();
  };

  const calculateAverageScore = () => {
    const scores = rightAnswers.map((right, index) => 
      calculateScore(right, wrongAnswers[index])
    );
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / scores.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-[--theme-background-color] p-6"
        style={{
          backgroundColor: 'var(--theme-leaguecard-color)',
        }}
      >

        
        <DialogHeader>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-medium text-[--theme-text-color]">
                UWorld
              </DialogTitle>
              <a 
                href="https://www.uworld.com/app/index.html#/login/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-[--theme-link-color] hover:text-[--theme-hover-text]"
              >
                Visit
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

        <div className="mt-6 space-y-6">
          <div className="bg-[--theme-leaguecard-color] p-4 rounded-lg border-2 border-[--theme-border-color] shadow-md">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Topic Name"
                value={newPulse.name}
                onChange={(e) => setNewPulse({...newPulse, name: e.target.value})}
                className="flex-grow bg-[--theme-input-bg] text-[--theme-text-color] border-2 border-[--theme-border-color] focus:border-[--theme-hover-color]"
              />
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-[--theme-success-text] mb-1 font-medium">Correct</span>
                  <Input
                    type="number"
                    min="0"
                    value={newPulse.positive || ''}
                    onChange={(e) => setNewPulse({...newPulse, positive: parseInt(e.target.value) || 0})}
                    className="w-20 text-center bg-[--theme-success-bg] border-2 border-[--theme-success-border] text-[--theme-success-text]"
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-[--theme-error-text] mb-1 font-medium">Incorrect</span>
                  <Input
                    type="number"
                    min="0"
                    value={newPulse.negative || ''}
                    onChange={(e) => setNewPulse({...newPulse, negative: parseInt(e.target.value) || 0})}
                    className="w-20 text-center bg-[--theme-error-bg] border-2 border-[--theme-error-border] text-[--theme-error-text]"
                    placeholder="0"
                  />
                </div>
                <button
                  onClick={handleAddPulse}
                  className="px-4 h-12 bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                            border-2 border-[--theme-border-color] 
                            hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                            shadow-md rounded-lg transition flex items-center justify-center
                            text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {dataPulses && dataPulses.map((pulse, index) => (
            <div 
              key={pulse.id}
              className="bg-[--theme-leaguecard-color] p-4 rounded-lg border-2 border-[--theme-border-color] shadow-md"
            >
              <div className="flex items-center gap-4">
                <p className="flex-grow font-medium text-[--theme-text-color]">{pulse.name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[--theme-success-text] mb-1 font-medium">Correct</span>
                    <Input
                      type="number"
                      min="0"
                      value={rightAnswers[index]}
                      onChange={(e) => handleRightAnswersChange(index, e.target.value)}
                      className="w-20 text-center bg-[--theme-success-bg] border-2 border-[--theme-success-border] text-[--theme-success-text]"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[--theme-error-text] mb-1 font-medium">Incorrect</span>
                    <Input
                      type="number"
                      min="0"
                      value={wrongAnswers[index]}
                      onChange={(e) => handleWrongAnswersChange(index, e.target.value)}
                      className="w-20 text-center bg-[--theme-error-bg] border-2 border-[--theme-error-border] text-[--theme-error-text]"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="relative h-1 bg-[--theme-border-color] rounded-full mt-3">
                <div 
                  className="absolute h-full bg-[--theme-progress-color] rounded-full transition-all duration-300"
                  style={{ width: `${calculateScore(rightAnswers[index], wrongAnswers[index])}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {/* TODO: Add summary logic */}}
            className="px-4 py-2 text-gray-800 bg-gray-100 rounded hover:bg-gray-200"
          >
            Summary
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Scores
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UWorldPopup; 