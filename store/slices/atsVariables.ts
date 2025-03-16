/* --- Constants ----- */

// Video pause timestamps and their corresponding prompts
export const VIDEO_TIMESTAMPS = {
  ALPHA_CARBON: 45, // seconds
} as const;

export const KALYPSO_PROMPTS = {
  INITIAL: "Meow there! I'm Kalypso. I can answer questions about your studying or content.",
  ALPHA_CARBON: "Meow! While we're taking a break, let me ask you something important: What defines an alpha carbon in an amino acid, and why is it important?",
  // Add more prompts as needed
  // Example: BETA_SHEET: "Meow! Let's talk about beta sheets...",
} as const;

// Type for all available timestamps
export type TimestampKeys = keyof typeof VIDEO_TIMESTAMPS;

// Type for all available prompts
export type PromptKeys = keyof typeof KALYPSO_PROMPTS; 