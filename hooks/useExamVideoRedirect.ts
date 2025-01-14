import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserInfo } from '@/hooks/useUserInfo';

const EXEMPT_PATHS = ['/examcalendar', '/api', '/auth'];

export const useExamVideoRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { userInfo, isLoading: isLoadingUserInfo } = useUserInfo();

  useEffect(() => {
    const checkStudyPlan = async () => {
      // Don't check if we're on exempt paths
      if (EXEMPT_PATHS.some(path => pathname?.startsWith(path))) {
        return;
      }

      try {
        const response = await fetch('/api/study-plan');
        if (!response.ok) {
          throw new Error('Failed to fetch study plan');
        }
        
        const data = await response.json();
        
        if (!data.studyPlan) {
          router.push('/examcalendar');
        }
      } catch (error) {
        // If there's an error fetching the study plan, redirect to be safe
        router.push('/examcalendar');
      }
    };

    if (!isLoadingUserInfo) {
      checkStudyPlan();
    }
  }, [isLoadingUserInfo, router, pathname]);
}; 