"use client";
import { usePathname, useSearchParams } from "next/navigation";
import TestComponent from "@/components/test-component";
import { useEffect, useState } from "react";
import { VocabProvider } from '@/contexts/VocabContext';
import { useUserActivity } from '@/hooks/useUserActivity';
import { useExamVideoRedirect } from "@/hooks/useExamVideoRedirect";

const TestQuestions = () => {
  useExamVideoRedirect();
  const searchParams = useSearchParams();
  const testId = searchParams?.get('id');
  const { startActivity, updateActivityEndTime } = useUserActivity();
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);

  // Modify the useEffect for activity tracking
  useEffect(() => {
    const initializeActivity = async () => {
      // Only start a new activity if we're on the home page and don't have an active one
        const activity = await startActivity({
          type: 'testing',
          location: "CARs",
          metadata: {
            initialLoad: true,
            testId: testId,
            timestamp: new Date().toISOString()
          }
        });

        if (activity) {
          setCurrentActivityId(activity.id);
        }
      }

    initializeActivity();
  }, [ ]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  // Add periodic update for activity end time
  useEffect(() => {
    if (!currentActivityId) return;

    // Update every 5 minutes 
    const intervalId = setInterval(() => {
      handleUpdateActivityTime()
    }, 300000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [currentActivityId, updateActivityEndTime]);

  if (!testId) {
    return <div className="text-white">No test ID provided</div>;
  }

  return (
    <VocabProvider>
      <div className="fixed inset-0 overflow-hidden bg-black">
        <TestComponent testId={testId} onTestComplete={handleUpdateActivityTime} updateActivityEndTime={handleUpdateActivityTime}/>
      </div>
    </VocabProvider>
  )

  function handleUpdateActivityTime(){
    updateActivityEndTime(currentActivityId)
  }
};

export default TestQuestions;