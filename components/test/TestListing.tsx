// components/TestListing.tsx
import React from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Passage } from "@/types";

interface TestListingProps {
  passages: Passage[];
}

const TestListing: React.FC<TestListingProps> = ({ passages }) => {
  const { user } = useUser();

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
          {passages.map((passage) => (
            <Link
              key={passage.id}
              href={`/test/testquestions?id=${passage.id}`}
              className="bg-[#071644] border-2 border-sky-500 text-md text-white rounded-lg shadow-md p-4 m-2 w-full max-w-xl"
            >
              <h2 className="text-ms font-medium mb-2">
                {passage.id}: {passage.text.substring(0, 50)}...
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestListing;