// app/components/UserTestResponse.tsx
import { UserResponse } from '@/types';

interface UserTestResponseProps {
  response: UserResponse;
}

export default function UserTestResponse({ response }: UserTestResponseProps) {
    if(!response.question) return
    const options = JSON.parse(response.question.questionOptions)  
    return (
    <div className="border p-4 rounded-lg mb-4">
      <h4 className="font-semibold">{response.question?.questionContent}</h4>
      <p>Your answer: {response.userAnswer}</p>
      <p>Correct answer: {options[0]}</p>
      <p className={response.isCorrect ? "text-green-500" : "text-red-500"}>
        {response.isCorrect ? "Correct" : "Incorrect"}
      </p>
      <p>Time spent: {response.timeSpent || "0"} seconds</p>
      {response.userNotes && <p>Your notes: {response.userNotes}</p>}
    </div>
  );
}