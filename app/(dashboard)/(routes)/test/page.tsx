// pages/test/index.tsx
"use client";

import React, { useEffect, useState } from "react";
import TestListing from "@/components/test/TestListing";
import { Passage } from "@/types";


const TestPage: React.FC = () => {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPassages();
  }, []);

  const fetchPassages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/passage');
      if (!response.ok) throw new Error('Failed to fetch passages');
      const data = await response.json();
      setPassages(data.passages);
    } catch (error) {
      console.error('Error fetching passages:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#001326] min-h-[80vh] text-black flex justify-center flex-col">
      <div className="max-w-full w-full flex-grow">
        {isLoading ? (
          <p className="text-white text-center">Loading passages...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <TestListing passages={passages} />
        )}
      </div>
    </div>
  );
};

export default TestPage;