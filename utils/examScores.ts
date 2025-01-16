export type SectionCode = "CARs" | "P/S" | "C/P" | "B/B";
export type SectionName = "CARs" | "Psych/Soc" | "Chem/Phys" | "Bio/Biochem";

export interface ProcessedExamScore {
  id: string;
  title: string;
  createdAt: Date;
  scheduledDate: Date | null;
  totalScore: number;
  sectionScores: Record<SectionName, number | null>;
}

export interface SectionAverages {
  CARs: number | null;
  "Psych/Soc": number | null;
  "Chem/Phys": number | null;
  "Bio/Biochem": number | null;
}

export const SECTION_CODE_TO_NAME: Record<SectionCode, SectionName> = {
  "CARs": "CARs",
  "P/S": "Psych/Soc",
  "C/P": "Chem/Phys",
  "B/B": "Bio/Biochem"
}; 