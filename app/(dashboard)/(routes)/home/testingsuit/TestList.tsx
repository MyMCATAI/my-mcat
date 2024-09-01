import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Test, UserTest } from '@/types';

interface TestListProps {
  items: (Test | UserTest)[];
  type: 'upcoming' | 'past';
}

const truncateTitle = (title: string, maxLength: number) => {
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
  return (
    <div>
      {items.map((item) => (
        <div key={item.id} className="mb-4 mt-4">
          <Link href={type === 'upcoming' ? `/test/testquestions?id=${item.id}` : `/user-test/${item.id}`}>
            <div className="flex justify-between items-center bg-transparent border border-blue-500 opacity-100 rounded-[15px] px-3 py-2 hover:bg-white hover:opacity-100 transition-all duration-300 group">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Image
                    className="mt-1 group-hover:filter group-hover:invert"
                    src="/computer.svg"
                    width={28}
                    height={28}
                    alt="icon"
                  />
                </div>
                <h2 className="text-sm text-white font-normal group-hover:text-black">
                  {truncateTitle(type === 'upcoming' ? (item as Test).title : (item as UserTest).test.title, 10)}
                </h2>
              </div>
              <h2 className={`text-md font-medium ${getPercentageColor(type === 'upcoming' ? 0 : (item as UserTest).score ?? 0)} group-hover:text-black`}>
                {type === 'upcoming' ? '0%' : `${((item as UserTest).score ?? 0).toFixed(2)}%`}
              </h2>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default TestList;