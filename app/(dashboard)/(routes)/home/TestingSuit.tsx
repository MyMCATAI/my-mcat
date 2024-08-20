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
    <div className="testing-suit">
      <div className="tab-content">{tabs[activeTab].content}</div>
      <div className="tab-container flex justify-between mx-auto w-[70%] gap-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={clsx(
              "tab-button py-[30px] mt-10 rounded-[15px] flex-1",
              {
                "bg-[#C9C9C9] text-black hover:bg-[#a0a0a0]": activeTab !== index,
                "bg-blue-500 text-white": activeTab === index,
              }
            )}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
        <Link href="/review" className="flex-1">
          <button className="tab-button py-[30px] mt-10 rounded-[15px] w-full bg-green-500 text-white hover:bg-green-600">
            Review
          </button>
        </Link>
      </div>
    </div>
  );
};

export default TestingSuit;