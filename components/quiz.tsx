import React, { useState, useEffect } from "react";

export interface QuizQuestion {
  categoryId: string;
  contentCategory: string;
  id: string;
  passage: string | null;
  passageId: string | null;
  questionAnswerNotes: string | null;
  questionContent: string;
  questionID: string;
  questionOptions: string[];
}

interface QuizProps {
  questions: QuizQuestion[];
  shuffle?: boolean;
}

const Quiz: React.FC<QuizProps> = ({ questions, shuffle = false }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (shuffle) {
      setShuffledQuestions([...questions].sort(() => Math.random() - 0.5));
    } else {
      setShuffledQuestions(questions);
    }
  }, [questions, shuffle]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex < shuffledQuestions.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handlePrevQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  if (!currentQuestion) return null;

  return (
    <div className="bg-transparent text-black px-6 rounded-lg mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semi-bold text-white drop-shadow-lg">
          Question {currentQuestionIndex + 1}
        </h2>
        <span className="text-sm text-white drop-shadow-lg">
          {currentQuestionIndex + 1} of {shuffledQuestions.length}
        </span>
      </div>

      <div className="mb-2">
        <p className="text-lg mb-4 text-white drop-shadow-lg">{currentQuestion.questionContent}</p>
        {currentQuestion.passage && (
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <p className="text-sm">{currentQuestion.passage}</p>
          </div>
        )}
        <div className="space-y-2">
          {currentQuestion.questionOptions[0].split('", "').map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full text-left p-2 rounded ${
                selectedAnswer === option
                  ? "bg-[#0e2247] text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {String.fromCharCode(65 + index)}. {option.replace(/^\["|"\]$/g, '')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === shuffledQuestions.length - 1}
          className="px-4 py-2 bg-[#0e2247] text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Quiz;