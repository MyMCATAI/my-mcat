import React, { useState, useEffect } from "react";
import Image from "next/image";

interface QuizQuestion {
  question: string;
  options: string[];
  image?: string;
}

export interface QuizData {
  questions: QuizQuestion[];
  timeLimit: string;
}

interface QuizProps {
  quiz: QuizData;
  shuffle?: boolean;
}

const Quiz: React.FC<QuizProps> = ({ quiz, shuffle = false }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>(
    []
  );

  useEffect(() => {
    if (shuffle) {
      setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
    } else {
      setShuffledQuestions(quiz.questions);
    }
  }, [quiz, shuffle]);

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
    <div className="bg-transparent text-black px-6 rounded-lg  mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semi-bold text-white drop-shadow-lg">
          Question {currentQuestionIndex + 1}
        </h2>
        <span className="text-sm text-white drop-shadow-lg">
          Time Remaining: {quiz.timeLimit} | {currentQuestionIndex + 1} of{" "}
          {shuffledQuestions.length}
        </span>
      </div>

      <div className="mb-2">
        <p className="text-lg mb-4 text-white drop-shadow-lg">{currentQuestion.question}</p>
        {currentQuestion.image && (
          <div className="relative w-full h-64 mb-4">
            <Image
              src={currentQuestion.image}
              alt="Question Image"
              layout="fill"
              objectFit="contain"
            />
          </div>
        )}
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full text-left p-2 rounded ${
                selectedAnswer === option
                  ? "bg-[#0e2247] text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {String.fromCharCode(65 + index)}. {option}
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
