export interface InterruptionConfig {
  message: string;
  imageUrl: string;
  audioUrl?: string;
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export const INTERRUPTIONS = {
  PATIENT_EMERGENCY: {
    message: "Oh! A patient needs your help! 🏥 Quick!",
    imageUrl: "/kalypsodistressed.gif",
    audioUrl: "/warning.mp3",
    duration: 5000,
    position: "top-left"
  },
  ACHIEVEMENT_UNLOCKED: {
    message: "Great job! You've unlocked a new achievement! 🏆",
    imageUrl: "/kalypsoexcited.gif",
    audioUrl: "/achievement.mp3",
    duration: 4000,
    position: "top-right"
  },
  // ... more interruption types
} as const; 