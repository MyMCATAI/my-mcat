import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Cat, Stethoscope, BookOpen, Syringe, Microscope, GraduationCap, Dna } from 'lucide-react';

// Define the possible theme types
type ThemeType = 'empty' | 'cat' | 'medicine' | 'study' | 'vaccine' | 'science' | 'education' | 'genetics';

// Create an interface for the ThemedSkeleton props
interface ThemedSkeletonProps {
  theme: ThemeType;
}

export const ThemedSkeleton: React.FC<ThemedSkeletonProps> = ({ theme }) => {
  const iconMap: Record<ThemeType, JSX.Element> = {
    empty: <div className="w-6 h-6 bg-gray-300 rounded-full" />,
    cat: <Cat className="w-6 h-6 text-gray-300" />,
    medicine: <Stethoscope className="w-6 h-6 text-gray-300" />,
    study: <BookOpen className="w-6 h-6 text-gray-300" />,
    vaccine: <Syringe className="w-6 h-6 text-gray-300" />,
    science: <Microscope className="w-6 h-6 text-gray-300" />,
    education: <GraduationCap className="w-6 h-6 text-gray-300" />,
    genetics: <Dna className="w-6 h-6 text-gray-300" />
  };

  return (
    <div
      className="overflow-hidden rounded-lg text-center mb-2 relative group min-h-[100px] flex flex-col justify-between items-center"
      style={{ 
        backgroundColor: 'var(--theme-adaptive-tutoring-color)',
      }}
    >
      <div className="relative w-full h-full flex flex-col justify-center items-center">
        {iconMap[theme]}
        <Skeleton className="w-16 h-3 mt-2" />
      </div>
    </div>
  );
};
