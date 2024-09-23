'use client';

import React from 'react';
import ResourcesMenu from './ResourcesMenu';
import OfficeContainer from './OfficeContainer';

const DoctorsOfficePage: React.FC = () => {
  return (
    <div className="fixed inset-x-0 bottom-0 top-[4rem] flex bg-transparent text-white p-4">
      <div className="flex w-full h-full max-w-[calc(100%-1rem)] max-h-full">
        <div className="w-1/4 pr-4">
          <ResourcesMenu />
        </div>
        <div className="w-3/4">
          <OfficeContainer />
        </div>
      </div>
    </div>
  );
};

export default DoctorsOfficePage;
