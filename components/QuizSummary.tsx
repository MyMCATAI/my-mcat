import React from 'react';
import ContentRenderer from "./ContentRenderer";

interface AnswerSummary {
  questionContent: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent?: number;
}

interface QuizSummaryProps {
  summaries: AnswerSummary[];
  onReset: () => void;
}

const QuizSummary: React.FC<QuizSummaryProps> = ({ summaries, onReset }) => {
  const correctAnswers = summaries.filter(summary => summary.isCorrect).length;
  const totalQuestions = summaries.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const totalTime = summaries.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
  const averageTime = totalTime / summaries.length;

  return (
    <div className="bg-transparent text-black px-6 rounded-lg mx-auto h-full flex flex-col">
      <h2 className="text-2xl font-bold text-[--theme-text-color] mb-2">Quiz Summary</h2>
      
      <div className="mb-6 text-[--theme-text-color]">
        <p>Score: {correctAnswers}/{totalQuestions} ({percentage}%)</p>
        <p>Total Time: {totalTime.toFixed(1)} seconds</p>
        <p>Average Time per Question: {averageTime.toFixed(1)} seconds</p>
      </div>
      
      <div className="space-y-6 mb-6 overflow-y-auto flex-1">
        {summaries.map((summary, index) => (
          <div key={index} className="bg-white/10 p-4 rounded-lg">
            <div className="text-[--theme-text-color] mb-2">
              <span className="font-semibold">Question {index + 1}:</span>
              <ContentRenderer content={summary.questionContent} imageWidth="70%" />
            </div>
            
            <div className={`flex items-center gap-2 ${
              summary.isCorrect ? 'text-green-400' : 'text-red-400'
            }`}>
              <span className="font-semibold">Your answer:</span> {summary.userAnswer}
              {summary.isCorrect ? ' ✅' : ' ❌'}
            </div>
            
            {!summary.isCorrect && (
              <div className="text-green-400 mt-1">
                <span className="font-semibold">Correct answer:</span> {summary.correctAnswer}
              </div>
            )}
            
            <div className="text-[--theme-text-color] mt-1">
              <span className="font-semibold">Time spent:</span> {summary.timeSpent?.toFixed(1) || 0} seconds
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-auto pb-4">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-[#0e2247] text-white rounded hover:bg-[#1a3a6d]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default QuizSummary;