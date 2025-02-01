import { UserResponse, Annotation, Test } from "@/types";

interface SaveNoteParams {
  text: string;
  userTestId: string;
  questionId: string;
  timeSpent: number;
  onSuccess?: (savedResponse: UserResponse) => void;
  onUpdateContext?: (text: string) => void;
}

export const saveNote = async ({
  text,
  userTestId,
  questionId,
  timeSpent,
  onSuccess,
  onUpdateContext,
}: SaveNoteParams): Promise<void> => {
  try {
    // First, try to fetch the existing response
    const checkResponse = await fetch(
      `/api/user-test/response?userTestId=${userTestId}&questionId=${questionId}`,
      {
        method: "GET",
      }
    );
    const checkResponseJson = await checkResponse.json();

    let responseData: {
      id?: string;
      userTestId: string;
      questionId: string;
      timeSpent: number;
      userNotes: string;
    } = {
      userTestId,
      questionId,
      timeSpent,
      userNotes: text,
    };

    let method = "PUT";
    if (checkResponse.status === 404) {
      method = "POST";
    } else if (checkResponse.ok) {
      responseData.id = checkResponseJson.id;
    } else if (!checkResponse.ok) {
      throw new Error(
        `Failed to check existing response: ${checkResponse.status} ${checkResponse.statusText}`
      );
    }

    const response = await fetch("/api/user-test/response", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(responseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      throw new Error(
        `Failed to save user response: ${response.status} ${response.statusText}`
      );
    }

    const savedResponse: UserResponse = await response.json();
    onSuccess?.(savedResponse);

    // Update chatbot context if callback provided
    onUpdateContext?.(text);
  } catch (err) {
    console.error("Error saving user response:", err);
    throw err;
  }
};

interface SaveAnnotationsParams {
  userTest: { id: string } | null;
  questionId: string;
  annotations: Array<{ style: string; text: string }>;
  timeSpent?: number;
}

export const saveAnnotations = async ({
  userTest,
  questionId,
  annotations,
  timeSpent = 0,
}: SaveAnnotationsParams): Promise<UserResponse | null> => {
  if (!userTest) {
    console.error("UserTest is null");
    return null;
  }

  if (annotations.length === 0) return null;

  const delimiter = "|||";
  const userNotes = annotations
    .map((anno) => `${anno.style} : ${anno.text}`)
    .join(delimiter);

  try {
    // Check for existing response
    const checkResponse = await fetch(
      `/api/user-test/response?userTestId=${userTest.id}&questionId=${questionId}`,
      { method: "GET" }
    );

    const responseData: Partial<UserResponse> = {
      userTestId: userTest.id,
      questionId,
      timeSpent,
      userNotes,
    };

    let method = "POST";
    if (checkResponse.ok) {
      method = "PUT";
      const existingResponse = await checkResponse.json();
      responseData.id = existingResponse.id;
    }

    const response = await fetch("/api/user-test/response", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(responseData),
    });

    if (!response.ok) {
      throw new Error(`Failed to save annotations: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    console.error("Error saving annotations:", err);
    return null;
  }
};

export const extractQuotedStrings = (inputText: string): string[] => {
  const regex = /"([^"]+)"/g;
  const matches = [];
  let match;
  while ((match = regex.exec(inputText)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

interface SaveUserResponseParams {
  response: UserResponse;
  onSuccess?: (savedResponse: UserResponse) => void;
  onError?: (error: Error) => void;
}

export const saveUserResponse = async ({
  response,
  onSuccess,
  onError,
}: SaveUserResponseParams): Promise<void> => {
  try {
    const apiResponse = await fetch("/api/user-test/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error("Error response:", errorData);
      throw new Error(
        `Failed to save user response: ${apiResponse.status} ${apiResponse.statusText}`
      );
    }

    const savedResponse: UserResponse = await apiResponse.json();
    onSuccess?.(savedResponse);
  } catch (err) {
    console.error("Error saving user response:", err);
    if (err instanceof Error) {
      onError?.(err);
    } else {
      onError?.(new Error("Unknown error occurred while saving user response"));
    }
    throw err;
  }
};

interface CalculateScoreParams {
  test: Test | null;
  userResponses: UserResponse[];
  totalTimeInSeconds: number;
  numberOfPassageHighlights: number;
  numberOfPassageStrikethroughs: number;
  totalOptionsCrossedOut: number;
}

interface ScoreResult {
  score: number;
  correctAnswers: number;
  technique: number;
  averageTimePerQuestion: number;
}

export const calculateScore = ({
  test,
  userResponses,
  totalTimeInSeconds,
  numberOfPassageHighlights,
  numberOfPassageStrikethroughs,
  totalOptionsCrossedOut,
}: CalculateScoreParams): ScoreResult => {
  if (!test) return { score: 0, correctAnswers: 0, technique: 0, averageTimePerQuestion: 0 };

  const totalQuestions = test.questions.length;

  // Calculate correct answers
  const correctAnswers = userResponses.filter((r) => r.isCorrect).length;
  const score = (correctAnswers / totalQuestions) * 100;

  const averageTimePerQuestion = totalTimeInSeconds / totalQuestions;

  // Technique: highlight, passage strikethroughs, and crossed out options
  let technique = 0;

  if (numberOfPassageHighlights > 0) technique += 1;
  if (numberOfPassageStrikethroughs > 0) technique += 1;
  if (totalOptionsCrossedOut > 0) technique += 1;

  return { score, correctAnswers, technique, averageTimePerQuestion };
};