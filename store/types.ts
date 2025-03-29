// Shared type definitions for the store

// Window size type used in UI slice
export interface WindowSize {
  width: number;
  height: number;
  isDesktop: boolean;
}

// Theme type used in UI slice
export type ThemeType = 'cyberSpace' | 'sakuraTrees' | 'sunsetCity' | 'mykonosBlue';

// Onboarding-related types and constants
export const ONBOARDING_STEPS = {
  NAME: 1,
  COLLEGE: 2,
  ACADEMICS: 3,
  GOALS: 4,
  KALYPSO_DIALOGUE: 5,
  REFERRAL: 6,
  UNLOCK: 7
} as const;

export type OnboardingStep = typeof ONBOARDING_STEPS[keyof typeof ONBOARDING_STEPS];

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  invalidFields: string[];
  errors: string[];
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
  hasSeenIntroVideo: boolean;
}

export const DEFAULT_ONBOARDING_INFO = {
  currentStep: 0,
  onboardingComplete: false,
  firstName: null,
  college: null,
  isNonTraditional: null,
  isCanadian: null,
  gpa: null,
  currentMcatScore: null,
  hasNotTakenMCAT: null,
  mcatAttemptNumber: null,
  targetMedSchool: null,
  targetScore: null,
  referralEmail: null,
  hasSeenIntroVideo: false
} as const satisfies OnboardingInfo;

export const REQUIRED_STEPS = 3; // Minimum number of steps required for profile completion

// Audio-related types
export interface AudioBufferSourceWithGain {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
}

// Re-export types from slices for convenience
export * from './slices/audioSlice';