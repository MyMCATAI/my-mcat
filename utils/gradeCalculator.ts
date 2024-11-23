interface PerformanceMetrics {
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
  
  export function calculateQuestionsScore(questions: number): number {
    if (questions >= 200) return 100;
    if (questions >= 150) return 80;
    if (questions >= 100) return 60;
    if (questions >= 50) return 40;
    if (questions >= 25) return 20;
    return 0;
  }
  
  export function calculateTimeScore(avgTime: number): number {
    if (avgTime >= 55 && avgTime <= 65) return 100;
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
    if (historicalScores.length < 2) return 'flat';
  
    const recentScores = historicalScores.slice(-3); // Get last 3 scores
    const avgPreviousScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  
    const difference = currentScore - avgPreviousScore;
    if (Math.abs(difference) < 10) return 'flat'; // Less than 10% change is considered flat
    return difference > 0 ? 'up' : 'down';
  }
  
  export function calculateGrade(
    current: PerformanceMetrics,
    historicalScores: number[] = []
  ): GradeResult {
    // Calculate component scores
    const questionsScore = calculateQuestionsScore(current.questionsAnswered);
    const accuracyScore = current.accuracy; // Assuming accuracy is already in percentage
    const timeScore = calculateTimeScore(current.averageTime);
  
    // Calculate weighted total (25% questions, 50% accuracy, 25% time)
    const totalScore = (
      (questionsScore * 0.2) +
      (accuracyScore * 0.6) +
      (timeScore * 0.2)
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