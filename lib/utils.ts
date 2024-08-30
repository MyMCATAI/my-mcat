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