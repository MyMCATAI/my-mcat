// types/index.ts

import { IconName } from "@/components/ui/Icons";

export interface Passage {
  id: string;
  text: string;
  citation: string;
  title: string
}

export interface Category {
  id: string;
  section: string;
  subjectCategory: string;
  contentCategory: string;
  conceptCategory: string;
  generalWeight: number;
  color: string;
  icon: IconName;
  podcastLinks: string;
  isCompleted?: boolean;
  completedAt?: Date | null;
  completionPercentage?: number;
  conceptMastery?: number | null;
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
  context: string | null;
  passage?: Passage;  
  category?: Category;  
  difficulty: number;
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
  flagged?: boolean;
  timeSpent?: number | null; 
  userNotes?: string | null; 
  answeredAt?: Date;
  userTest?: UserTest | null;
  reviewNotes?: string | null;
  isReviewed?: Boolean | null;
}

export interface UserTest {
  id: string;
  userId: string;
  testId: string;
  passageId?: string | null;
  test: Test;
  startedAt: Date;
  finishedAt?: Date;
  reviewedAt?: Date;
  score?: number;
  responses: UserResponse[];
  totalResponses: number;
  reviewedResponses: number;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  setName?: string;
  createdAt: Date;
  updatedAt: Date;
  difficulty: number;
  passageId?: string | null;
  questions: TestQuestion[];
  userTests?: UserTest[]; 
}

export interface StudyPlan {
  id?: string;
  examDate: Date;
  resources: string[];
  hoursPerDay: Record<string, string>;
  fullLengthDays: string;
}
export interface NewActivity {
  activityTitle: string;
  activityText: string;
  hours: string;
  activityType: string;
  scheduledDate: string;
}

export interface Task {
  text: string;
  completed: boolean;
}

export interface FetchedActivity {
  id: string;
  userId: string;
  studyPlanId: string;
  categoryId: string | null;
  activityText: string;
  activityTitle: string;
  hours: number;
  activityType: string;
  link: string | null;
  status: string;
  scheduledDate: string;
  tasks?: Task[];  
}

export interface Flashcard {
  id: string;
  problem: string;
  answer: string;
  category: string;
  conceptMastery: number | null;
  contentMastery: number | null;
  correctAnswers: number;
  totalAttempts: number;
  lastAttemptAt: string | null;
}

export interface ReportData {
  userScore: number;
  totalTestsTaken: number;
  testsCompleted: number;
  completionRate: number;
  totalQuestionsAnswered: number;
  averageTestScore: number;
  averageTimePerQuestion: number;
  averageTimePerTest: number;
  categoryAccuracy: Record<string, number>;
  streak: number;
}

export interface DoctorOfficeStats {
  streak: number;
  patientsPerDay: number;
  qualityOfCare: number;
  averageStarRating: number | null;
  clinicCostPerDay: number;
}

export interface CalendarActivity {
  id: string;
  userId: string;
  studyPlanId: string;
  categoryId: string | null;
  activityText: string;
  activityTitle: string;
  hours: number;
  activityType: string;
  link: string | null;
  scheduledDate: string;
  createdAt: string; // or Date
  updatedAt: string; // or Date
  status: string;
  contentId: string | null;
}

export interface MedicalSchool {
  name: string;
  state: string;
  averageMCAT: string;
  averageGPA: string;
  description: string;
}

export interface TooltipProps {
  message: string;
  topPosition?: number;
}

export interface OnboardingFormData {
  firstName: string;
  college: string;
  isNonTraditional: boolean;
  isCanadian: boolean;
  gpa: string;
  diagnosticScore: string;
  hasNotTakenMCAT: boolean;
  attemptNumber: string;
  targetScore: string;
  medicalSchool: MedicalSchool | null;
}