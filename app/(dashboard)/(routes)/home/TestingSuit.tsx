import React, { useState } from "react";
import { Test } from "@/types";
import clsx from "clsx";
import Exams from "./testingsuit/Exams";
import Passages from "./testingsuit/Passages";

interface TestListingProps {
  tests: Test[];
}

const TestingSuit: React.FC<TestListingProps> = ({ tests }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "exams", content: <Exams tests={tests}/> },
    { label: "passages", content: <Passages tests={tests} /> },
  ];

  return (
    <div className="testing-suit">
      <div className="tab-content">{tabs[activeTab].content}</div>
      <div className="tab-container flex justify-between mx-auto w-[70%] gap-10">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={clsx(
              "tab-button py-[30px] mt-10 rounded-[15px] w-full",
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
      </div>
    </div>
  );
};

export default TestingSuit;
