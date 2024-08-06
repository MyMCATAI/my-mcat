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
    <div className="bg-[#ffffff] from-blue-900  h-[80vh] p-4 overflow-auto">
      <div className="px-4 flex justify-between">
        <div>
          <h1 className="text-black text-2xl font-bold mt-5">
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

      <div className=" p-4">
        <p className="text-black whitespace-pre-wrap">{passageData.text}</p>
        {passageData.citation && (
          <p className="text-black mt-4">Citation: {passageData.citation}</p>
        )}
      </div>
    </div>
  );
};

export default Passage;