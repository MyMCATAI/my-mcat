// components/TestListing.js
import React from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const TestListing = () => {
  const { user } = useUser();

  // Example list of items
  const items = [
    { id: 1, title: "CARs: Otherkin, Kanye West, and The Walking Dead. " },
    { id: 2, title: "CARs: Project 2025, Nero & His Femboy, Machine Learning" },
    { id: 3, title: "CARs: Materialistic Darwinism, Pow-chicka-wow-Wow, and Dante’s Inferno. " },
  ];

  return (
    <div className="bg-[#001326] min-h-screen p-8 text-white flex justify-center">
      <div className="max-w-screen-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            Welcome {user?.firstName ?? ""} to the Diagnostic Quiz
          </h1>
          <h1 className="text-2xl font-bold text-sky-500 my-4">
            Select The Quiz Below
          </h1>
        </div>
        <div className="flex flex-col justify-center items-center">
          {items.map((item) => (
            <Link
              key={item.id}
              href="/test/testquestions"
              className="bg-[#071644] border-2 border-sky-500 text-md text-white rounded-lg shadow-md p-4 m-2 w-full max-w-xl"
            >
              <h2 className="text-ms font-medium mb-2">{item.title}</h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestListing;
