// src/components/Icon.tsx
import React from 'react';
import { Icons, IconName } from './Icons';

interface IconProps {
  name: string;
  className?: string;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ name, className, color }) => {
  const iconName = name.endsWith('.svg') ? name.slice(0, -4) : name;
  const IconComponent = Icons[iconName as IconName];
  
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found`);
    return null;
  }
  
  return (
    <span className={className} style={{ color }}>
      <IconComponent style={{
        fill: color,
        stroke: color,
      }} />
    </span>
  );
};

export default Icon;