import React, { useState } from "react";
import { Test } from "@/types";
import clsx from "clsx";
import Link from 'next/link';
import Exams from "./testingsuit/Exams";
import Passages from "./testingsuit/Passages";

interface TestListingProps {
  tests: Test[];
}

const TestingSuit: React.FC<TestListingProps> = ({ tests }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "Exams", content: <Exams tests={tests}/> },
    { label: "Passages", content: <Passages tests={tests} /> },
  ];

  return (
    <div className="testing-suit h-full flex flex-col">
      {/* Commented out buttons
      <div className="flex justify-end gap-2 p-2">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={clsx(
              "px-3 py-1 text-xs rounded",
              {
                "bg-gray-200 text-black hover:bg-gray-300": activeTab !== index,
                "bg-blue-500 text-white": activeTab === index,
              }
            )}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
        <Link href="/review">
          <button className="px-3 py-1 text-xs rounded bg-green-500 text-white hover:bg-green-600">
            Review
          </button>
        </Link>
      </div>
      */}
      <div className="tab-content flex-grow overflow-auto">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default TestingSuit;