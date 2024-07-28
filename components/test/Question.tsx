import React from "react";
import { Question, TestQuestion } from "@/types";

interface QuestionsProps {
  testQuestion: TestQuestion;
  question: Question;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const Questions: React.FC<QuestionsProps> = ({ 
  testQuestion, 
  question, 
  onNext, 
  onPrevious, 
  isFirst, 
  isLast 
}) => {
  // Parse the questionOptions string into an array
  const options = JSON.parse(question.questionOptions);

  return (
    <div className="bg-[#001326] min-h-screen px-3">
      <div className="sticky top-0 left-0 right-0 text-white p-4 flex justify-between bg-[#001326]">
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className={`bg-[#ffffff] text-black py-2 px-4 rounded ${
            isFirst ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className={`bg-[#ffffff] text-black py-2 px-4 rounded ${
            isLast ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
        </button>
      </div>
      <div className="h-[80vh] overflow-auto p-4">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold my-4">{`Question ${question.questionID}`}</h1>
          <p className="text-white text-xl mb-4">{question.questionContent}</p>
          <form className="text-white space-y-2">
            {options.map((option: string, idx: number) => (
              <label key={idx} className="flex items-center">
                <input
                  type="radio"
                  name={`question${question.questionID}`}
                  value={`option${idx + 1}`}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Questions;
