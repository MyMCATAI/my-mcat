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
        const data = await response.json();
        
        // Redirect if no study plan exists
        if (!data?.studyPlan) {
          router.push('/examcalendar');
        }
      } catch (error) {
        console.error('Error checking study plan:', error);
      }
    };

    if (!isLoadingUserInfo) {
      checkStudyPlan();
    }
  }, [isLoadingUserInfo, router, pathname]);
}; 