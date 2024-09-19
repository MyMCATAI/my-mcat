import React from 'react';

const Tasks: React.FC = () => {
  return (
    <div className="bg-[#0E2247] text-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl mb-2">{"TODAY'S TASK"}</h2>
      <div className="bg-white text-black p-4 rounded-md h-40">Study org chem</div>
    </div>
  );
};

export default Tasks;