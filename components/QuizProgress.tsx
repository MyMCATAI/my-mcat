import React from 'react';

// Add the interfaces needed
interface AnswerSummary {
  questionContent: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  questionNumber: number;
}

interface QuizProgressProps {
  summaries: AnswerSummary[];
  totalQuestions: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({ summaries, totalQuestions }) => {
  const answeredQuestions = summaries.length;
  const correctAnswers = summaries.filter(s => s.isCorrect).length;
  const averageTime = summaries.length > 0 
    ? summaries.reduce((acc, curr) => acc + curr.timeSpent, 0) / summaries.length 
    : 0;

  return (
    <div className="space-y-4 bg-[--theme-adaptive-tutoring-color]">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-[--theme-adaptive-tutoring-color] border border-[--theme-border-color]">
          <h3 className="font-semibold text-[--theme-text-color]">Correct Answers</h3>
          <p className="text-[--theme-text-color]">{correctAnswers} of {answeredQuestions}</p>
        </div>
        <div className="p-4 rounded-lg bg-[--theme-adaptive-tutoring-color] border border-[--theme-border-color]">
          <h3 className="font-semibold text-[--theme-text-color]">Avg. Time per Question</h3>
          <p className="text-[--theme-text-color]">{Math.round(averageTime)} seconds</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="font-semibold text-[--theme-text-color]">Question Details</h3>
        {summaries.map((summary, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg ${
              summary.isCorrect 
                ? 'bg-green-500/20 border-green-500/30' 
                : 'bg-red-500/20 border-red-500/30'
            }`}
          >
            <p className="font-semibold text-gray-900">Question {summary.questionNumber}</p>
            <p className="text-sm mt-1 text-gray-800">
              {summary.questionContent.replace(/<img[^>]*>/g, '')}
            </p>
            <div className="mt-2 text-sm text-gray-800">
              <p>Your answer: {summary.userAnswer}</p>
              <p>Correct answer: {summary.correctAnswer}</p>
              <p>Time taken: {Math.round(summary.timeSpent)} seconds</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizProgress;