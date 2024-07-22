import React from "react";

const Questions = () => {
  const options = [
    "Helping labor unions to achieve their goals without student help",
    "Taking the right to organize away from public-sector employees",
    "Universities that focus on educating and developing their students",
    "Labor studies departments that can influence private universities",
  ];

  return (
    <div className="bg-[#001326]">
     <div className="sticky top-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between">
        <button className="bg-[#ffffff] text-black py-2 px-4 rounded">
          Previous
        </button>
        <button className="bg-[#ffffff] text-black py-2 px-4 rounded">
          Next
        </button>
      </div>
      <div className="h-[80vh] overflow-auto p-4">
        <h1 className="text-white text-2xl font-bold my-4">Question 1</h1>
        <p className="text-white text-xl mb-4">
          The author can best be viewed as an advocate of:
        </p>
        <form className="text-white space-y-2">
          {options.map((option, index) => (
            <label key={index} className="flex items-center">
              <input
                type="radio"
                name="question1"
                value={`option${index + 1}`}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </form>
      </div>
    </div>
  );
};

export default Questions;
