import { useState, useEffect } from 'react';
import { FullLengthExam } from '@prisma/client';
import { 
  ProcessedExamScore, 
  SectionAverages,
} from '@/utils/examScores';

interface UseExamScoresReturn {
  examScores: ProcessedExamScore[];
  sectionAverages: SectionAverages;
  isLoading: boolean;
  error: Error | null;
}

interface APIResponse {
  examScores: Array<{
    id: string;
    title: string;
    createdAt: string;
    scheduledDate: string | null;
    totalScore: number;
    sectionScores: {
      CARs: number | null;
      "Psych/Soc": number | null;
      "Chem/Phys": number | null;
      "Bio/Biochem": number | null;
    };
  }>;
  sectionAverages: SectionAverages;
}

export function useExamScores(): UseExamScoresReturn {
  const [examScores, setExamScores] = useState<ProcessedExamScore[]>([]);
  const [sectionAverages, setSectionAverages] = useState<SectionAverages>({
    CARs: null,
    "Psych/Soc": null,
    "Chem/Phys": null,
    "Bio/Biochem": null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchExamScores() {
      try {
        const response = await fetch('/api/full-length-exam/complete');
        if (!response.ok) {
          throw new Error(`Failed to fetch exam scores: ${response.statusText}`);
        }
        
        const data: APIResponse = await response.json();
        
        // Transform dates from strings to Date objects
        const processedScores = data.examScores.map(exam => ({
          ...exam,
          createdAt: new Date(exam.createdAt),
          scheduledDate: exam.scheduledDate ? new Date(exam.scheduledDate) : null,
        }));

        setExamScores(processedScores);
        setSectionAverages(data.sectionAverages);
        setError(null);
      } catch (err) {
        console.error('Error in useExamScores:', err);
        setError(err instanceof Error ? err : new Error('An error occurred while fetching exam scores'));
        setExamScores([]);
        setSectionAverages({
          CARs: null,
          "Psych/Soc": null,
          "Chem/Phys": null,
          "Bio/Biochem": null
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchExamScores();
  }, []);

  return {
    examScores,
    sectionAverages,
    isLoading,
    error
  };
} 