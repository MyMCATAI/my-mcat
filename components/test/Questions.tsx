import React, { useState } from "react";

interface Question {
  id: string;
  questionID: string;
  questionContent: string;
  questionOptions: string;
  questionAnswerNotes?: string;
  contentCategory: string;
}

interface QuestionsProps {
  questions: Question[];
}

const Questions: React.FC<QuestionsProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Parse the questionOptions string into an array
  const options = currentQuestion ? JSON.parse(currentQuestion.questionOptions) : [];

  return (
    <div className="bg-[#001326] min-h-screen px-3">
      <div className="sticky top-0 left-0 right-0 text-white p-4 flex justify-between bg-[#001326]">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`bg-[#ffffff] text-black py-2 px-4 rounded ${
            currentQuestionIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className={`bg-[#ffffff] text-black py-2 px-4 rounded ${
            currentQuestionIndex === questions.length - 1
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          Next
        </button>
      </div>
      <div className="h-[80vh] overflow-auto p-4">
        {currentQuestion && (
          <div className="mb-8">
            <h1 className="text-white text-2xl font-bold my-4">{`Question ${currentQuestion.questionID}`}</h1>
            <p className="text-white text-xl mb-4">{currentQuestion.questionContent}</p>
            <form className="text-white space-y-2">
              {options.map((option: string, idx: number) => (
                <label key={idx} className="flex items-center">
                  <input
                    type="radio"
                    name={`question${currentQuestion.questionID}`}
                    value={`option${idx + 1}`}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;