// src/components/Icon.tsx
import React from 'react';
import { Icons, IconName } from './Icons';

interface IconProps {
  name: string;  // Change back to string to accept names with .svg
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className }) => {
  // Remove .svg extension if present
  const iconName = name.endsWith('.svg') ? name.slice(0, -4) : name;

  // Type assertion here is safe because we've removed the .svg extension
  const IconComponent = Icons[iconName as IconName];

  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found`);
    return null;
  }

  return <IconComponent className={className} />;
};

export default Icon;