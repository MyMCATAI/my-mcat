import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
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
    console.log(data)
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