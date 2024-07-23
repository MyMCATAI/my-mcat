"use client";

import React from "react";
import TestListing from "@/components/test/TestListing";

const TestPage = () => {
  return (
    <div className="bg-[#001326] min-h-[80vh] text-black flex justify-center flex-col">
      <div className="max-w-full w-full flex-grow">
      
        <TestListing/>
      </div>
    </div>
  );
};

export default TestPage;
