export interface PerformanceMetrics {
    questionsAnswered: number;
    accuracy: number; // Expected to be in percentage (0-100)
    averageTime: number; // In seconds
  }
  
  export interface GradeResult {
    grade: 'S' | 'A' | 'B' | 'C' | 'D';
    score: number; // Total weighted score
    trend: 'up' | 'down' | 'flat';
    componentScores: {
      questionsScore: number;
      accuracyScore: number;
      timeScore: number;
    };
  }
  
  export function calculateQuestionsScore(questions: number, subject: string): number {
    // Keep CARs scoring the same
    if (subject === "CARs") {
      if (questions >= 200) return 100;
      if (questions >= 150) return 80;
      if (questions >= 100) return 60;
      if (questions >= 50) return 40;
      if (questions >= 25) return 20;
      return 0;
    }

    // Higher threshold for other sections
    if (questions >= 400) return 100;
    if (questions >= 300) return 80;
    if (questions >= 200) return 60;
    if (questions >= 100) return 40;
    if (questions >= 50) return 20;
    return 0;
  }
  
  export function calculateTimeScore(avgTime: number): number {
    if (avgTime >= 55 && avgTime <= 65) return 100;  // Perfect for CARs
    if ((avgTime >= 45 && avgTime <= 54) || (avgTime >= 66 && avgTime <= 75)) return 80;
    if ((avgTime >= 35 && avgTime <= 44) || (avgTime >= 76 && avgTime <= 85)) return 60;
    if ((avgTime >= 25 && avgTime <= 34) || (avgTime >= 86 && avgTime <= 95)) return 40;
    return 20;
  }
  
  export function getLetterGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
    if (score >= 95) return 'S';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    return 'D';
  }
  
  export function calculateTrend(
    currentScore: number,
    historicalScores: number[]
  ): 'up' | 'down' | 'flat' {
    // If not enough historical data, return flat
    if (historicalScores.length < 15) return 'flat';

    // Get the last 15 scores
    const previousScores = historicalScores.slice(-15);
    const avgPreviousScore = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;

    const difference = currentScore - avgPreviousScore;
    if (Math.abs(difference) < 5) return 'flat'; // Less than 5% change is considered flat
    return difference > 0 ? 'up' : 'down';
  }
  
  export function calculateAccuracyScore(accuracy: number): number {
    if (accuracy >= 90) return 100;
    if (accuracy >= 80) return 90;
    if (accuracy >= 70) return 80;
    if (accuracy >= 60) return 70;
    if (accuracy >= 50) return 60;
    if (accuracy >= 40) return 50;
    if (accuracy >= 30) return 40;
    if (accuracy >= 20) return 30;
    if (accuracy >= 10) return 20;
    return 10;
  }
  
  export function calculateGrade(
    current: PerformanceMetrics,
    historicalScores: number[] = [],
    subject: string
  ): GradeResult {
    const questionsScore = calculateQuestionsScore(current.questionsAnswered, subject);
    const accuracyScore = calculateAccuracyScore(current.accuracy);
    const timeScore = calculateTimeScore(current.averageTime);

    // Adjust weights to emphasize accuracy even more
    // Questions: 15%, Accuracy: 70%, Time: 15%
    const totalScore = (
      (questionsScore * 0.15) +
      (accuracyScore * 0.70) +
      (timeScore * 0.15)
    );

    const grade = getLetterGrade(totalScore);
    const trend = calculateTrend(totalScore, historicalScores);
  
    return {
      grade,
      score: totalScore,
      trend,
      componentScores: {
        questionsScore,
        accuracyScore,
        timeScore
      }
    };
  }