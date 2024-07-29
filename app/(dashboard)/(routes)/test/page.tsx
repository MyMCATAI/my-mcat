// pages/test/index.tsx
"use client";

import React, { useEffect, useState } from "react";
import TestListing from "@/components/test/TestListing";
import { Test } from "@/types";


const TestPage: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);
  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/test');
      if (!response.ok) throw new Error('Failed to fetch tests');
      const data = await response.json();
      setTests(data.tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#001326] min-h-[80vh] text-black flex justify-center flex-col">
      <div className="max-w-full w-full flex-grow">
        {isLoading ? (
          <p className="text-white text-center">Loading tests...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <TestListing tests={tests} />
        )}
      </div>
    </div>
  );
};

export default TestPage;