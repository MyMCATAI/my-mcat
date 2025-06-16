import React from 'react';
import { UserButton } from '@clerk/nextjs';

export const ProfileButton = () => {
  return (
    <div className="flex items-center">
      <UserButton />
    </div>
  );
}; 