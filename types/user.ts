// types/user.ts
// This file contains shared types for user-related data

import { OnboardingInfo } from './index';

export interface UserInfo {
  unlocks?: string[];
  userId: string;
  bio: string;
  firstName: string;
  apiCount: number;
  score: number;
  streak: number;
  email?: string;
  clinicRooms: string;
  hasPaid: boolean;
  subscriptionType: string;
  diagnosticScores: {
    total: string;
    cp: string;
    cars: string;
    bb: string;
    ps: string;
  };
  notificationPreference?: string;
  onboardingInfo?: OnboardingInfo;
  referrals?: any[];
  createdAt: Date;
}

export interface Referral {
  id: string;
  userId: string;
  referrerName: string;
  referrerEmail: string;
  friendEmail: string;
  friendUserId: string;
  createdAt: Date;
  joinedAt: Date | null;
} 