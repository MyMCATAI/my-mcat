"use client";
import { useSearchParams } from "next/navigation";
import TestComponent from "@/components/test-component";
import { useEffect } from "react";
import { VocabProvider } from '@/contexts/VocabContext'; // Import VocabProvider

const TestQuestions = () => {
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');

  useEffect(() => {
    // Disable scrolling and hide overflow on mount
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    
    // Re-enable scrolling and reset styles on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  if (!testId) {
    return <div className="text-white">No test ID provided</div>;
  }

  return (
    <VocabProvider> {/* Wrap the entire content with VocabProvider */}
      <div className="fixed inset-0 overflow-hidden bg-black">
        <TestComponent testId={testId} />
      </div>
    </VocabProvider>
  );
};

export default TestQuestions;