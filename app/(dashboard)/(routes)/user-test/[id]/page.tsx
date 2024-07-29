// app/user-test/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import UserTestDetails from '@/components/user-test/UserTestDetails';
import { UserTest } from '@/types';

export default function UserTestDetailsPage() {
  const [userTest, setUserTest] = useState<UserTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) fetchUserTest(id as string);
  }, [id]);

  const fetchUserTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/user-test/${testId}`);
      if (!response.ok) throw new Error('Failed to fetch user test');
      const data = await response.json();
      setUserTest(data);
    } catch (err) {
      setError('Error fetching user test');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#001326] min-h-screen text-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Test Details</h1>
          <Link href="/review" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            Back to Review
          </Link>
        </div>
        
        {loading && (
          <div className="bg-[#0A2744] p-4 rounded-lg">
            Loading...
          </div>
        )}
        
        {error && (
          <div className="bg-red-900 text-red-100 p-4 rounded-lg">
            Error: {error}
          </div>
        )}
        
        {!loading && !error && !userTest && (
          <div className="bg-yellow-900 text-yellow-100 p-4 rounded-lg">
            Test not found
          </div>
        )}
        
        {!loading && !error && userTest && (
          <div className="bg-[#0A2744] p-6 rounded-lg">
            <UserTestDetails userTest={userTest} />
          </div>
        )}
      </div>
    </div>
  );
}