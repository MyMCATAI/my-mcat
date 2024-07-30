import React from "react";
import Schedule from "./Schedule";
import KnowledgeProfile from "./KnowledgeProfile";

const Page = () => {
  return (
    <div className="">
      <div className="container py-10">
        <div className="text-white flex gap-4">
          <div className="w-4/5">
            <Schedule />
          </div>
          <div className="w-1/5">
            <KnowledgeProfile/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
