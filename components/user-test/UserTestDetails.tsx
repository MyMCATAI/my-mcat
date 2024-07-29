// app/user-test/components/UserTestDetails.tsx
import { UserTest, UserResponse } from '@/types';
import UserTestResponse from './UserTestResponse';

interface UserTestDetailsProps {
  userTest: UserTest;
}

export default function UserTestDetails({ userTest }: UserTestDetailsProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{userTest.test.title}</h2>
      <p>Questions: {userTest.test.questions.length}</p>
      <p>Started: {new Date(userTest.startedAt).toLocaleString()}</p>
      <p>Finished: {userTest.finishedAt ? new Date(userTest.finishedAt).toLocaleString() : 'Not finished'}</p>
      <p>Score: {userTest.score !== null ? `${userTest.score?.toFixed(2)}%` : 'Not scored'}</p>
      
      <h3 className="text-lg font-semibold mt-4 mb-2">Responses</h3>
      {userTest.responses.map((response: UserResponse) => (
        <UserTestResponse key={response.id} response={response} />
      ))}
    </div>
  );
}