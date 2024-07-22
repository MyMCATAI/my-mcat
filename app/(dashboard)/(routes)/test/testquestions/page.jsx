"use client";

import Passage from "@/components/test/Passage";
import Questions from "@/components/test/Questions";
import React from "react";

const TestQuestions = () => {
  return (
    <div className="bg-[#001326] min-h-[80vh] text-black flex justify-center flex-col">
      <div className="max-w-full w-full flex-grow">
        <div className=" bg-gray-800 text-white p-4 flex justify-between border-b-2 border-sky-500">
          <h1 className="text-white text-lg font-semi-bold mb-0 mt-2">
            Medical College Admission Test - Labor Studies Department
          </h1>
          <p className="">
            Timer
          </p>
        </div>
        <div className="flex flex-row h-screen ">
          <div className="w-1/2 border-r-2 border-sky-500">
            <Passage />
          </div>
          <div className="w-1/2">
            <Questions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestQuestions;
