// types/index.ts

import { IconName } from "@/components/ui/Icons";

export interface Passage {
  id: string;
  text: string;
  citation: string;
  title: string;
  difficulty: number;
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

export interface UserResponseWithCategory extends Omit<UserResponse, 'question'> {
  question: Question & {
    category?: Category;
    types?: string;
  };
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
  testsReviewed: number;
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

export interface Annotation {
  style: string;
  text: string;
}
export interface OnboardingInfo {
  currentStep: number;
  onboardingComplete: boolean;
  firstName: string | null;
  college: string | null;
  isNonTraditional: boolean | null;
  isCanadian: boolean | null;
  gpa: number | null;
  currentMcatScore: number | null;
  hasNotTakenMCAT: boolean | null;
  mcatAttemptNumber: string | null;
  targetMedSchool: string | null;
  targetScore: number | null;
  referralEmail: string | null;
  hasSeenIntroVideo?: boolean | null;
}

export enum ProductType {
  COINS_10 = "coins_10",
  COINS_50 = "coins_50",
  COINS_10_DISCOUNT = "coins_10_discount",
  MD_PREMIUM = "md_premium",
  MD_GOLD = "md_gold",
  MD_GOLD_ANNUAL = "md_gold_annual",
  MD_GOLD_BIANNUAL = "md_gold_biannual"
}

export type ProductName = "TenCoins" | "FiftyCoins" | "MDPremium" | "MDGold" | "MDGoldAnnual" | "MDGoldBiannual"; // these are set in the stripe product metadata in Stripe Dashboard

// Type guard to check if a string is a valid ProductType
export function isValidProductType(type: string): type is ProductType {
  return Object.values(ProductType).includes(type as ProductType);
}

// Helper to get coin amount for a product type or name
export function getCoinAmountForProduct(productType: ProductType, productName?: ProductName): number {
  // First check product name if provided
  if (productName) {
    switch (productName) {
      case "FiftyCoins":
        return 25;
      case "TenCoins":
        return 10;
      case "MDPremium":
      case "MDGold":
        return 0;
    }
  }

  // Fall back to product type if no name or unrecognized name
  switch (productType) {
    case ProductType.COINS_50:
      return 25;
    case ProductType.COINS_10:
    case ProductType.COINS_10_DISCOUNT:
      return 10;
    case ProductType.MD_PREMIUM:
    case ProductType.MD_GOLD:
      return 0; // Premium/Gold subscriptions don't use coins
    default:
      return 10;
  }
}