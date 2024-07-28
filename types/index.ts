// types/index.ts

export interface Passage {
  id: string;
  text: string;
  citation: string;
}

export interface Test {
  id: string;
  title: string;
  description: string | null;
  setName: string | null;
  createdAt: string;
  updatedAt: string;
  questions: TestQuestion[];
  _count?: {
    questions: number;
  };
}

export interface TestQuestion {
  id: string;
  testId: string;
  questionId: string;
  sequence: number;
  question: Question;
}

export interface Question {
  id: string;
  questionID: string;
  questionContent: string;
  questionOptions: string;  
  questionAnswerNotes: string;
  contentCategory: string;
  passageId?: string
}