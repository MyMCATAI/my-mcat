// app/user-test/components/UserTestList.tsx
import Link from 'next/link';
import { UserTest } from '@/types';

interface UserTestListProps {
  userTests: UserTest[];
}

export default function UserTestList({ userTests }: UserTestListProps) {
  return (
    <div className="space-y-4">
      {userTests.map((test) => (
        <div key={test.id} className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold">{test.test?.title ?? "Untitled"}</h2>
          <p>Started: {new Date(test.startedAt).toLocaleString()}</p>
          <p>Score: {test.score !== null ? `${test.score?.toFixed(2)}%` : 'Not finished'}</p>
          <Link href={`/user-test/${test.id}`} className="text-blue-500 hover:underline">
            Review Answers
          </Link>
        </div>
      ))}
    </div>
  );
}