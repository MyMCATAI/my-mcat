import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Test, UserTest } from '@/types';
import { useTheme } from 'next-themes'; // Import useTheme hook

interface TestListProps {
  items: (Test | UserTest)[];
  type: 'upcoming' | 'past';
}

const truncateTitle = (title: string | undefined, maxLength: number) => {
  if (!title) return ''; // Return empty string if title is undefined
  if (title.length > maxLength) {
    return `${title.substring(0, maxLength)}...`;
  }
  return title;
};

const getPercentageColor = (percentage: number) => {
  if (percentage < 50) return "text-red-500";
  if (percentage >= 50 && percentage <= 80) return "text-yellow-500";
  return "text-green-500";
};

const TestList: React.FC<TestListProps> = ({ items, type }) => {
  const { theme } = useTheme(); // Get the current theme

  return (
    <div className="w-full space-y-3">
      {items.map((item) => (
        <div key={item.id} className="w-full">
          <Link href={`/test/testquestions?id=${item.id}`}>
            <div className={`flex justify-between items-center bg-transparent border-2 opacity-100 rounded-[15px] px-3 py-2.5 hover:opacity-100 transition-all duration-300 group w-full hover:[background-color:var(--theme-hover-color)] theme-box ${theme}`}
                 style={{ 
                   borderColor: 'var(--theme-border-color)',
                   color: 'var(--theme-text-color)'
                 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 relative">
                  <Image
                    className="theme-svg"
                    src={"/computer.svg"}
                    layout="fill"
                    objectFit="contain"
                    alt="icon"
                  />
                </div>
                <h2 className="text-sm font-normal group-hover:[color:var(--theme-hover-text)]">
                  {truncateTitle('title' in item ? item.title : 'Untitled', 10)}
                </h2>
              </div>
              <h2 className={`text-sm font-medium ${getPercentageColor(type === 'past' && 'score' in item ? item.score || 0 : 0)}`}>
                {type === 'past' && 'score' in item ? `${item.score || 0}%` : '0%'}
              </h2>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default TestList;