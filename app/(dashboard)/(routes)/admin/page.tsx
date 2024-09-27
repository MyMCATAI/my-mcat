"use client"

import React, { useState } from "react";
import SearchPage from "./search";
import NewPassagePage from "./newpassage";

const AdminPage: React.FC = () => {
  const [showNewPassage, setShowNewPassage] = useState(false);
  const toggleNewPassage = () => {
    setShowNewPassage(!showNewPassage);
  };
  return (
<div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl text-black font-bold mb-4">Admin Panel</h1>
        {showNewPassage ? (
          <div>
            {/* <button
              onClick={toggleNewPassage}
              className="mb-4 px-4 py-2 bg-gray-200 rounded"
            >
              Back to Search
            </button> */}
            <NewPassagePage onCancel={toggleNewPassage} />
          </div>
        ) : (
          <SearchPage onAddNew={toggleNewPassage} />
        )}
      </div>
    </div>
  );
};
export default AdminPage;
