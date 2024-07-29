// app/user-test/page.tsx
"use client";

import { useState, useEffect } from 'react';
import UserTestList from '@/components/user-test/UserTestList';
import { UserTest } from '@/types';

export default function UserTestListPage() {
  const [userTests, setUserTests] = useState<UserTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserTests();
  }, []);

  const fetchUserTests = async () => {
    try {
      const response = await fetch('/api/user-test');
      if (!response.ok) throw new Error('Failed to fetch user tests');
      const data = await response.json();
      setUserTests(data.userTests);
    } catch (err) {
      setError('Error fetching user tests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Tests</h1>
      <UserTestList userTests={userTests} />
    </div>
  );
}