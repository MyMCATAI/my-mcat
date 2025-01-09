export const SECTION_MAPPINGS = {
  "Chemical and Physical Foundations": "C/P",
  "Critical Analysis and Reasoning": "CARS",
  "Biological and Biochemical Foundations": "B/B",
  "Psychological, Social, and Biological Foundations": "P/S"
} as const;

export const REVERSE_SECTION_MAPPINGS = {
  "C/P": "Chemical and Physical Foundations",
  "CARS": "Critical Analysis and Reasoning",
  "B/B": "Biological and Biochemical Foundations",
  "P/S": "Psychological, Social, and Biological Foundations"
} as const;

export const DISPLAY_TO_FULL_SECTION = {
  "Chem Phys": "Chemical and Physical Foundations",
  "CARS": "Critical Analysis and Reasoning",
  "Bio Biochem": "Biological and Biochemical Foundations",
  "Psych Soc": "Psychological, Social, and Biological Foundations"
} as const; 
export const FULL_TO_DISPLAY_SECTION = {
  "Chemical and Physical Foundations": "Chem Phys",
  "Critical Analysis and Reasoning": "CARS",
  "Biological and Biochemical Foundations": "Bio Biochem", 
  "Psychological, Social, and Biological Foundations": "Psych Soc"
} as const;

export const DISPLAY_TO_SHORT_SECTION = {
  "Chem Phys": "C/P",
  "CARS": "CARS", 
  "Bio Biochem": "B/B",
  "Psych Soc": "P/S"
} as const;
