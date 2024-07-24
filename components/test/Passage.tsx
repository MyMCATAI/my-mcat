import React from "react";

export interface PassageData {
  id: string;
  text: string;
  citation: string;
}

interface PassageProps {
  passageData: PassageData;
}

const Passage: React.FC<PassageProps> = ({ passageData }) => {
  return (
    <div className="bg-[#001326]">
      <div className="px-4 flex justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold mt-5">
            Passage {passageData.id}
          </h1>
        </div>
        {/* 
        <div>
          <div className="text-white p-4 flex justify-end">
            <button className="bg-[#ffffff] text-black py-2 px-4 mx-3 rounded">
              Highlight
            </button>
            <button className="bg-[#ffffff] text-black py-2 px-4 rounded">
              StrikeThrough
            </button>
          </div>
        </div>
        */}
      </div>

      <div className="max-h-[60vh] overflow-auto p-4">
        <p className="text-white whitespace-pre-wrap">{passageData.text}</p>
        {passageData.citation && (
          <p className="text-gray-400 mt-4">Citation: {passageData.citation}</p>
        )}
      </div>
    </div>
  );
};

export default Passage;