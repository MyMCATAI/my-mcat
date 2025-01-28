import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import prisma from "@/lib/prismadb";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string){
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export async function checkProStatus(): Promise<boolean> {
  try {
    const response = await fetch('/api/subscription');
    if (!response.ok) {
      throw new Error('Failed to fetch subscription status');
    }
    const data = await response.json();
    return data.isPro;
  } catch (error) {
    console.error('Error checking pro status:', error);
    return false;
  }
}

export const allowedAdminUserIds = [
  "user_2jCZfJZbTtFdqyqwcjaMNTOz1Lm",
  "user_2krxKeoPq12i3Nm8AD77AkIwC3H"
];

interface TranscriptSegment {
  timestamp: number; // in seconds
  text: string;
}

export function parseTranscript(transcript: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const parts = transcript.split(/\[(\d{2}):(\d{2}):?(\d{2})?\]/);
  
  let currentText = parts[0].trim(); // Text before first timestamp
  if (currentText) {
    segments.push({ timestamp: 0, text: currentText });
  }

  // Process remaining parts in groups of 4 (full match, minutes, seconds, optional hours)
  for (let i = 1; i < parts.length; i += 4) {
    const minutes = parseInt(parts[i] || '0');
    const seconds = parseInt(parts[i + 1] || '0');
    const hours = parseInt(parts[i + 2] || '0');
    const timestamp = hours * 3600 + minutes * 60 + seconds;
    const text = parts[i + 3]?.trim();
    
    if (text) {
      segments.push({ timestamp, text });
    }
  }

  return segments;
}

export function getRelevantTranscript(transcript: string, currentTime: number, maxWords: number = 800): string {
  const segments = parseTranscript(transcript);
  let relevantText = '';
  let wordCount = 0;
  
  // Find the current segment
  const currentSegmentIndex = segments.findIndex(seg => seg.timestamp > currentTime);
  const startIndex = currentSegmentIndex === -1 ? segments.length - 1 : currentSegmentIndex - 1;
  
  // Start from current segment and work backwards
  for (let i = startIndex; i >= 0; i--) {
    const segmentWords = segments[i].text.split(/\s+/);
    
    // Check if adding this segment would exceed word limit
    if (wordCount + segmentWords.length > maxWords) {
      // Add partial segment up to word limit
      const remainingWords = maxWords - wordCount;
      const partialText = segmentWords.slice(-remainingWords).join(' ');
      relevantText = partialText + ' ' + relevantText;
      break;
    }
    
    // Add full segment
    relevantText = segments[i].text + ' ' + relevantText;
    wordCount += segmentWords.length;
  }

  return relevantText.trim();
}


export interface Task {
  text: string;
  completed: boolean;
}

export interface TaskMapping {
  [eventTitle: string]: any;
}

export const parseDefaultTasks = (csvContent: string): TaskMapping => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const mapping: TaskMapping = {};
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(cell => cell.trim());
    
    // CSV format: Minutes,Task,Task 1,Task 2,Task 3
    const minutes = row[0];
    const taskName = row[1];
    const tasks = row.slice(2)
      .filter(task => task && task !== '')
      .map(task => ({
        text: task,
        completed: false
      }));
    
    if (taskName) {
      // If taskName already exists, append new tasks to existing array
      if (mapping[taskName]) {
        mapping[taskName].push(tasks);
      } else {
        // Otherwise, create new array with tasks
        mapping[taskName] = [tasks];
      }
    }
  }
  
  return mapping;
};

export async function checkAllActivitiesComplete(userId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysActivities = await prisma.calendarActivity.findMany({
    where: {
      userId,
      scheduledDate: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  return todaysActivities.length > 0 && 
    todaysActivities.every(activity => activity.status === "Complete");
}

export const KNOWLEDGE_PROFILE_UPDATE_KEY = 'lastKnowledgeProfileUpdate';

export const shouldUpdateKnowledgeProfiles = (): boolean => {
  const lastUpdate = localStorage.getItem(KNOWLEDGE_PROFILE_UPDATE_KEY);
  if (!lastUpdate) return true;

  const lastUpdateDate = new Date(lastUpdate);
  const currentDate = new Date();
  
  // Check if last update was on a different day
  return lastUpdateDate.toDateString() !== currentDate.toDateString();
};

export const updateKnowledgeProfileTimestamp = (): void => {
  localStorage.setItem(KNOWLEDGE_PROFILE_UPDATE_KEY, new Date().toISOString());
};

export const fetchDefinitionAndAddToVocab = async (
  word: string,
  addVocabWord: (word: string, definition: string) => void
) => {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch definition');
    }
    
    const data = await response.json();
    const firstEntry = data[0];
    
    const uniqueDefinitions = firstEntry.meanings.reduce(
      (acc: any[], meaning: any) => {
        if (
          !acc.some((def: any) => def.partOfSpeech === meaning.partOfSpeech)
        ) {
          acc.push({
            partOfSpeech: meaning.partOfSpeech,
            definition: meaning.definitions[0].definition,
          });
        }
        return acc;
      },
      []
    );

    const allDefinitions = uniqueDefinitions
      .map((def: any) => `(${def.partOfSpeech}) ${def.definition}`)
      .join("; ");

    addVocabWord(word, allDefinitions);
  } catch (err) {
    console.error("Error fetching definition:", err);
    addVocabWord(word, ""); // Add word with empty definition if fetch fails
  }
};

// Date utility functions
export const toUTCDate = (date: string | Date) => {
  // Keep the date in local time, don't do any UTC conversion
  const d = new Date(date);
  // Zero out the time portion but keep it in local time
  d.setHours(0, 0, 0, 0);
  return d;
};

export const formatDisplayDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
