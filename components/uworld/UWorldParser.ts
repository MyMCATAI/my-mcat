import { toast } from 'react-hot-toast';
import { mainUWorldSubjects } from '@/constants/uworld';
import { UWorldTask, ParsedUWorldData } from './types';

/* --- Constants ----- */
const HEADER_PATTERNS = [
    /UserId/i,
    /NAME\s+USAGE\s+CORRECT Q\s+INCORRECT Q\s+OMITTED Q\s+P-RANK/i,
    /\d+\/\d+\/\d+,\s+\d+:\d+\s+[AP]M/,
    /^RANK\s+/i,
    /^P-RANK\s+/i,
    /^NAME\s+/i
];

const isHeaderLine = (line: string): boolean => {
    return HEADER_PATTERNS.some(pattern => pattern.test(line)) ||
        line.includes('USAGE') ||
        line.includes('CORRECT Q') ||
        line.includes('INCORRECT Q') ||
        line.includes('OMITTED Q');
};

const cleanSubjectName = (subject: string): string => {
    return subject
        .replace(/^(RANK|P-RANK)\s+/, '') // Remove RANK or P-RANK prefix
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
};

const parseTaskLine = (line: string): UWorldTask | null => {
    console.log('\nParsing task line:', line);

    // Skip header lines
    if (isHeaderLine(line)) {
        console.log('Skipping header line:', line);
        return null;
    }

    // Match the format: Subject Name   44/187   18 (41%)   26 (59%)   0 (0%)   -
    const pattern = /([A-Za-z, &]+)\s+(\d+)\/(\d+)\s+(\d+)\s+\(\d+%\)\s+(\d+)\s+\(\d+%\)\s+\d+\s+\(\d+%\)(?:\s+(?:-|\d+(?:st|nd|rd|th)))?/;
    const match = line.trim().match(pattern);

    if (!match) {
        console.log('No valid match found for line');
        return null;
    }

    const [, subject, used, total, correct, incorrect] = match;
    const cleanSubject = cleanSubjectName(subject);

    // Skip if subject is in mainUWorldSubjects
    if (mainUWorldSubjects.includes(cleanSubject)) {
        console.log('Skipping main subject:', cleanSubject);
        return null;
    }

    console.log('Extracted components:', {
        subject: cleanSubject,
        total: parseInt(total),
        correct: parseInt(correct),
        incorrect: parseInt(incorrect)
    });

    return {
        text: `${total} Q UWorld - ${cleanSubject}`,
        subject: cleanSubject,
        completed: true,
        correctAnswers: parseInt(correct),
        incorrectAnswers: parseInt(incorrect)
    };
};

export const parseUWorldPDF = (text: string): ParsedUWorldData | null => {
    console.log('\n=== Starting PDF parse ===');
    console.log('Text length:', text.length);

    try {
        // Clean up the text first
        const cleanText = text
            .replace(/\r\n/g, '\n')
            .replace(/about:blank/g, '')
            .replace(/\u0000/g, '')
            .trim();

        // Split the text into potential task entries using a regex pattern
        const taskPattern = /[A-Za-z, &]+\s+\d+\/\d+\s+\d+\s+\(\d+%\)\s+\d+\s+\(\d+%\)\s+\d+\s+\(\d+%\)(?:\s+(?:-|\d+(?:st|nd|rd|th)))?/g;
        const potentialTasks = cleanText.match(taskPattern) || [];

        const tasks: UWorldTask[] = [];

        for (const taskText of potentialTasks) {
            const parsedTask = parseTaskLine(taskText);
            if (parsedTask) {
                tasks.push(parsedTask);
            }
        }

        if (tasks.length === 0) {
            toast.error('No valid tasks found in the PDF. Please check the format.');
            return null;
        }

        return {
            tasks,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error parsing UWorld PDF:', error);
        toast.error('Error parsing PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
        return null;
    }
};