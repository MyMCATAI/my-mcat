import { tileWidth, tileHeight } from './constants';

export function screenX(worldX: number, worldY: number): number {
  return (worldX - worldY) * (tileWidth / 2);
}

export function screenY(worldX: number, worldY: number): number {
  return (worldX + worldY) * (tileHeight / 2);
}

export const getAccentColor = () => {
  const themeElement =
    document.querySelector('.theme-sunsetCity') ||
    document.querySelector('.theme-sakuraTrees') ||
    document.querySelector('.theme-cyberSpace') ||
    document.querySelector('.theme-mykonosBlue') ||
    document.documentElement;
  const computedStyle = getComputedStyle(themeElement!);
  const accentColor = computedStyle.getPropertyValue('--theme-doctorsoffice-accent').trim();
  return accentColor || '#001226';
};

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface MessageResponse {
  greeting: string;
  message: string;
}

interface TimeMessages {
  [key: string]: string[];
}

const welcomeMessages: TimeMessages = {
  morning: [
    "Rise and shine! Time to help some patients.",
    "Starting the day with some great medical practice!",
    "Fresh morning, fresh minds - ready to learn?",
    "Early bird gets the medical knowledge!",
  ],
  afternoon: [
    "Perfect time for some medical practice!",
    "Keep the momentum going this afternoon!",
    "Taking medical excellence to new heights today!",
    "Your afternoon patients await, Doctor!",
  ],
  evening: [
    "Evening rounds - let's finish strong!",
    "Great time for some evening study!",
    "Wrapping up the day with more learning!",
    "Evening clinic hours are the best hours!",
  ],
  night: [
    "Night shift learning at its finest!",
    "Burning the midnight oil, Doctor?",
    "Late night study session - impressive dedication!",
    "The hospital never sleeps, and neither does learning!",
  ],
};

const successMessages: TimeMessages = {
  morning: [
    "Excellent morning progress!",
    "Starting the day off right!",
    "Morning productivity at its finest!",
    "Great way to kick off the day!",
  ],
  afternoon: [
    "Fantastic afternoon work!",
    "Keeping the momentum strong!",
    "Making this afternoon count!",
    "Peak performance today!",
  ],
  evening: [
    "Excellent evening progress!",
    "Finishing the day strong!",
    "Great evening accomplishments!",
    "Success doesn't stop at sunset!",
  ],
  night: [
    "Impressive late-night dedication!",
    "Night shift excellence!",
    "Midnight mastery achieved!",
    "Outstanding night session!",
  ],
};

export const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getWelcomeMessage = (firstName: string = ''): MessageResponse => {
  const timeOfDay = getTimeOfDay();
  const greeting = `Good ${timeOfDay}, Dr. ${firstName}!`;
  const message = getRandomMessage(welcomeMessages[timeOfDay]);
  return { greeting, message };
};

export const getSuccessMessage = (firstName: string = ''): MessageResponse => {
  const timeOfDay = getTimeOfDay();
  const greeting = `Excellent work, Dr. ${firstName}!`;
  const message = getRandomMessage(successMessages[timeOfDay]);
  return { greeting, message };
}; 