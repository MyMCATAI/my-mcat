'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserInfo } from '@/hooks/useUserInfo';
import { OnboardingInfo } from '@/types';

interface UserInfoContextType {
  userInfo: UserInfo | null;
  refreshUserInfo: () => Promise<void>;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export const UserInfoProvider = ({ children }: { children: React.ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const refreshUserInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/user-info');
      if (!response.ok) throw new Error();
      const data = await response.json();
      await handleRedirect(data);
      setUserInfo(data);
    } catch (error) {
      console.error('Failed to refresh user info:', error);
    }
  }, []);


// Helper function to check if onboarding is complete
function isOnboardingComplete(onboardingInfo?: OnboardingInfo): boolean {
  if (!onboardingInfo) return false;

  // Only check for targetScore
  const targetScore = onboardingInfo.targetScore;
  return targetScore !== undefined && targetScore !== null && targetScore > 0;
}

// Helper function to check if a path is accessible based on subscription
function canAccessPath(subscriptionType: string | undefined, currentPath: string): boolean {
  // System paths that are always accessible
  const systemPaths = ['/api', '/auth'];
  if (systemPaths.some(path => currentPath.startsWith(path))) {
    return true;
  }

  // Paths accessible to all users
  const unrestrictedPaths = ['/onboarding', '/mobile', '/ankiclinic', '/preferences'];
  if (unrestrictedPaths.some(path => currentPath.startsWith(path))) {
    return true;
  }

  // All other paths require gold or premium subscription
  return subscriptionType === 'gold' || subscriptionType === 'premium';
}

// Helper function to determine if and where to redirect
async function checkRedirectPath(userInfo: UserInfo | null, currentPath: string): Promise<string | null> {
  // Don't redirect if already on redirect page
  if (currentPath === '/redirect') return null;

  // Don't redirect to onboarding if we're already there
  if (currentPath.startsWith('/onboarding') || currentPath.startsWith('/mobile')) return null;

  // No user info -> onboarding
  if (!userInfo) return '/onboarding';

  // Incomplete onboarding -> onboarding
  if (!isOnboardingComplete(userInfo.onboardingInfo)) return '/onboarding';

  // Check subscription-based access
  if (!canAccessPath(userInfo.subscriptionType, currentPath)) {
    return '/ankiclinic';
  }

  // Only exempt paths from study plan check
  const studyPlanExemptPaths = ['/examcalendar', '/api', '/auth', '/onboarding', '/redirect'];
  const shouldCheckStudyPlan = !studyPlanExemptPaths.some(path => currentPath.startsWith(path));

  // Subscribed users -> check study plan (unless on exempt path)
  if (shouldCheckStudyPlan && (userInfo.subscriptionType === 'gold' || userInfo.subscriptionType === 'premium')) {
    try {
      const studyPlanResponse = await fetch('/api/study-plan');
      if (!studyPlanResponse.ok) {
        throw new Error('Failed to fetch study plan');
      }
      const studyPlanData = await studyPlanResponse.json();

      if (!studyPlanData.studyPlan) return '/examcalendar';
    } catch (error) {
      console.error('Error fetching study plan:', error);
    }
  }

  return null;
}

// Helper function to handle redirect checks and navigation
async function handleRedirect(userInfo: UserInfo | null): Promise<boolean> {
  const redirectPath = await checkRedirectPath(userInfo, window.location.pathname);
  if (redirectPath) {
    window.location.href = redirectPath;
    return true;
  }
  return false;
}

  return (
    <UserInfoContext.Provider value={{ userInfo, refreshUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
};

export const useUserInfoContext = () => {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error('useUserInfoContext must be used within UserInfoProvider');
  }
  return context;
};