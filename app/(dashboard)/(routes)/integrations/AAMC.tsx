import React, { useState, useEffect } from 'react';

const AAMC: React.FC = () => {
  const [selectedFL, setSelectedFL] = useState<string | null>(null);

  // Mock data for FL scores
  const flScores = [
    { level: 'FL1', score: 505 },
    { level: 'FL2', score: 510 },
    { level: 'FL3', score: 515 },
    { level: 'FL4', score: 520 },
    { level: 'FL5', score: 525 },
    { level: 'FL6', score: 530 },
  ];

  useEffect(() => {
    // Load selected FL from localStorage
    const savedFL = localStorage.getItem('selectedFL');
    if (savedFL) {
      setSelectedFL(savedFL);
    }
  }, []);

  const handleFLSelect = (level: string) => {
    setSelectedFL(level);
    localStorage.setItem('selectedFL', level);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-2 bg-[#FFFDF3]">
      <div className="w-full max-w-4xl flex flex-col gap-4">
        {/* Top row: Graph and FL Scores */}
        <div className="flex gap-4">
          {/* Left column: Graph */}
          <div className="w-2/3 bg-white shadow-lg rounded-lg p-4 flex items-center justify-center">
            <p className="text-xl font-bold">Graph Placeholder</p>
          </div>
          {/* Right column: FL Score buttons */}
          <div className="w-1/3 flex flex-col gap-4">
            {flScores.map(({ level, score }) => (
              <button
                key={level}
                className={`bg-white shadow-lg rounded-lg p-4 flex justify-between items-center w-full ${
                  selectedFL === level ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleFLSelect(level)}
              >
                <span className="font-bold">{level}</span>
                <span>{score}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Bottom row: AI Summary */}
        <div className="w-full bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">AI Summary</h2>
          <p className="text-sm">
            Your MCAT progress shows steady improvement across all sections. In CARS, your critical analysis skills have sharpened, 
            particularly in interpreting complex passages. For Bio/Biochem, enzyme kinetics and cellular respiration concepts are 
            strong, but consider reviewing membrane transport. In C/P, your understanding of thermodynamics is solid, but 
            electromagnetism could use more focus. P/S scores indicate good grasp of cognitive theories, but social psychology 
            terms need attention. Overall, you&apos;re on track for a competitive score. Keep up the consistent study habits!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AAMC;

