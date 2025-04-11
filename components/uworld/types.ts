import { uniqueCategories } from "@/constants/uworld";

export interface UWorldTask {
    text: string;
    completed: boolean;
    subject: string;
    correctAnswers: number;
    incorrectAnswers: number;
}

export interface ParsedUWorldData {
    tasks: UWorldTask[];
    timestamp: string;
    userId?: string;
    userName?: string;
}

export type UWorldTopic = keyof typeof uniqueCategories;