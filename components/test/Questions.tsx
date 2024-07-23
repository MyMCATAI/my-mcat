import React, { useState } from "react";

const Questions = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const questions = [
    {
      question: "The author can best be viewed as an advocate of:",
      options: [
        "Helping labor unions to achieve their goals without student help",
        "Taking the right to organize away from public-sector employees",
        "Universities that focus on educating and developing their students",
        "Labor studies departments that can influence private universities",
      ],
    },
    {
      question: "What is the main purpose of the passage?",
      options: [
        "To inform readers about labor union strategies",
        "To argue for the importance of student involvement in labor unions",
        "To describe the challenges faced by public-sector employees",
        "To criticize universities for their lack of focus on labor studies",
      ],
    },
    {
      question: "The author can best be viewed as an advocate of:",
      options: [
        "Helping labor unions to achieve their goals without student help",
        "Taking the right to organize away from public-sector employees",
        "Universities that focus on educating and developing their students",
        "Labor studies departments that can influence private universities",
      ],
    },
    {
      question: "What is the main purpose of the passage?",
      options: [
        "To inform readers about labor union strategies",
        "To argue for the importance of student involvement in labor unions",
        "To describe the challenges faced by public-sector employees",
        "To criticize universities for their lack of focus on labor studies",
      ],
    },
  ];

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
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold my-4">{`Question ${
            currentQuestionIndex + 1
          }`}</h1>
          <p className="text-white text-xl mb-4">{currentQuestion.question}</p>
          <form className="text-white space-y-2">
            {currentQuestion.options.map((option, idx) => (
              <label key={idx} className="flex items-center">
                <input
                  type="radio"
                  name={`question${currentQuestionIndex + 1}`}
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
