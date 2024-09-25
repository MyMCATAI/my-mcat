'use client';

import React, { useState } from 'react';
import ResourcesMenu from './ResourcesMenu';
import OfficeContainer from './OfficeContainer';
import FloatingButton from '../home/FloatingButton';
import { useRouter } from 'next/navigation';

const DoctorsOfficePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('doctorsoffice');
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    if (tab !== 'doctorsoffice') {
      router.push(`/home?tab=${tab}`);
    }
    setActiveTab(tab);
  };

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
      <FloatingButton 
        onTabChange={handleTabChange} 
        currentPage="doctorsoffice" 
        initialTab={activeTab}
      />
    </div>
  );
};

export default DoctorsOfficePage;
