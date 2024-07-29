// types/index.ts

export interface Passage {
  id: string;
  text: string;
  citation: string;
}
export interface Category {
  id: string;
  section:          String
  subjectCategory:  String
  contentCategory:  String
  conceptCategory:  String
  generalWeight:    number
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
  questionAnswerNotes?: string | null;  
  contentCategory: string;
  passageId?: string | null;  
  categoryId: string;  
  passage?: Passage;  
  category?: Category;  
  testQuestions?: TestQuestion[]; 
  userResponses?: UserResponse[]; 
}

export interface UserResponse {
  id: string;
  userTestId?: string | null;
  questionId: string;
  question?: Question;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent?: number | null; 
  userNotes?: string | null; 
  answeredAt?: Date;
  userTest?: UserTest | null;
}

export interface UserTest {
  id: string;
  userId: string;
  testId: string;
  test: Test;
  startedAt: Date;
  finishedAt?: Date;
  score?: number;
  responses: UserResponse[];
}

export interface Test {
  id: string;
  title: string;
  description: string;
  setName?: string;
  createdAt: Date;
  updatedAt: Date;
  questions: TestQuestion[];
  userTests?: UserTest[]; 
}