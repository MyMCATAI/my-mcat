"use client";

import { useParams } from "next/navigation";
import EditQuestions from "../../editquestions";

export default function EditQuestionsPage() {
  const params = useParams();
  const passageId = params?.id as string;

  return (
    <EditQuestions
      passageId={passageId}
    />
  );
}