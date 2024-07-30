"use client"
import React from "react";
import Schedule from "./Schedule";
import KnowledgeProfile from "./KnowledgeProfile";


const Page = () => {

  return (
    <div className="">




      
      <div className="container py-10">
        <div className="text-white flex gap-10">
          <div className="" style={{ width: "75%" }}>
          

            
            
            <Schedule />
          </div>
          <div style={{ width: "25%" }}>
            <KnowledgeProfile />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
