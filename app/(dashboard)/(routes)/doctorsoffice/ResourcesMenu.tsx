import React from 'react';

const ResourcesMenu: React.FC = () => {
  return (
    <div className="h-full">
      <div className="flex flex-col bg-[#001226] items-center h-full rounded-lg p-4 overflow-auto">
        <img
          src="/path/to/profile-pic.png"
          alt="Profile Picture"
          className="w-24 h-24 rounded-full mb-4"
        />
        <div className="space-y-2 w-full">
          <div>Stat 1: Value</div>
          <div>Stat 2: Value</div>
          <div>Stat 3: Value</div>
          <div>Stat 4: Value</div>
          <div>Stat 5: Value</div>
          <div>Stat 6: Value</div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesMenu;
