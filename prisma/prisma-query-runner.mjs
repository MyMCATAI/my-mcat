import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'QueryOutputs');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'flashcards_output.txt');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const fetchFlashcards = async (page = 1) => {
    const url = `http://localhost:3000/api/flashcard?page=${page}&pageSize=10`;
    console.log(`Attempting to fetch from: ${url}`);
    
    try {
        console.log('Sending request...');
        const response = await fetch(url);
        
        // Log response details
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        // Get the raw text first
        const text = await response.text();
        console.log('Raw response:', text.substring(0, 500)); // First 500 characters
        
        // Try parsing as JSON if it looks like JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse response as JSON');
            return;
        }

        if (!data.flashcards) {
            console.error('No flashcards found in response:', data);
            return;
        }

        console.log(`Fetched ${data.flashcards.length} flashcards`);

        const flashcardDetails = data.flashcards.map((flashcard) =>
            `ID: ${flashcard.id}, Problem: ${flashcard.problem}, Answer: ${flashcard.answer}`
        ).join('\n');

        fs.writeFileSync(OUTPUT_FILE, flashcardDetails, { flag: 'w' });
        console.log(`Flashcards have been written to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            type: error.type
        });
    }
};

console.log('Starting flashcard fetch...');
fetchFlashcards(1);