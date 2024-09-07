import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

interface Passage {
  title: string;
  description: string;
  citation: string;
  content: string;
  difficulty: number;
}

interface Question {
  content: string;
  options: string[];
  correctAnswer: string;
  conceptCategory: string;
  contentCategory: string;
  difficulty: number;
}


interface PassageWithQuestions extends Passage {
  questions: Question[];
}

async function createPassagesQuestionsAndTests(processOnlyFirstPassage: boolean = false) {
  console.log('Starting createPassagesQuestionsAndTests function');
  const inputFilePath = path.join(process.cwd(), 'data', 'passages_and_questions.txt');
  console.log(`Reading file from: ${inputFilePath}`);
  const fileContent = fs.readFileSync(inputFilePath, { encoding: 'utf-8' });
  console.log('File content read successfully');
  const passagesWithQuestions = parsePassagesAndQuestions(fileContent);
  console.log(`Parsed ${passagesWithQuestions.length} passages with questions`);

  console.log('Fetching all categories');
  const categories = await prisma.category.findMany();
  console.log(`Fetched ${categories.length} categories`);

  for (const [index, passageData] of passagesWithQuestions.entries()) {
    if (processOnlyFirstPassage && index > 0) {
      console.log('Processing only first passage. Exiting loop.');
      break;
    }

    console.log(`Processing passage ${index + 1}: ${passageData.title}`);
    try {
      // Create passage
      const passageId = passageData.title.split('-')[0].trim().replace(/\s+/g, '_').toLowerCase();
      console.log(`Creating passage with ID: ${passageId}`);
      const passage = await prisma.passage.create({
        data: {
          id: passageId,
          title: passageData.title,
          description: passageData.description,
          citation: passageData.citation,
          text: passageData.content,
          difficulty: passageData.difficulty,
        },
      });
      console.log(`Created passage: ${passage.id}`);

      // Create questions
      const questions = [];
      console.log(`Creating ${passageData.questions.length} questions for passage ${passageId}`);
      for (let i = 0; i < passageData.questions.length; i++) {
        const questionData = passageData.questions[i];
        console.log(`Processing question ${i + 1}`);
        const category = categories.find(cat =>
          cat.conceptCategory === questionData.conceptCategory &&
          cat.contentCategory === questionData.contentCategory
        );

        if (!category) {
          console.log(`No matching category found for question ${i + 1} in passage ${passageId}. Creating new category.`);
          const newCategory = await prisma.category.create({
            data: {
              subjectCategory: 'CARs',
              contentCategory: questionData.contentCategory,
              conceptCategory: questionData.conceptCategory,
              generalWeight: 1,
              section: 'CARs',
              color: '',
              icon: '',
            },
          });
          categories.push(newCategory); // Add new category to the array
          console.log(`Created new category: ${newCategory.id}`);
        }

        const questionOptions = [questionData.correctAnswer, ...questionData.options.filter(opt => opt !== questionData.correctAnswer)];
        console.log(`Creating question with ID: ${questionData.contentCategory}_${passageId}_${i + 1}`);
        const question = await prisma.question.create({
          data: {
            questionID: `${questionData.contentCategory}_${passageId}_${i + 1}`,
            questionContent: questionData.content,
            questionOptions: JSON.stringify(questionOptions),
            questionAnswerNotes: '',
            contentCategory: questionData.contentCategory,
            passageId: passage.id,
            categoryId: category!.id,
            difficulty: questionData.difficulty,
          },
        });
        questions.push(question);
        console.log(`Created question: ${question.questionID}`);
      }

      // Create tests
      const createTest = async (title: string, questionIds: string[]) => {
        console.log(`Creating test: ${title}`);
        const test = await prisma.test.create({
          data: {
            title,
            description: passageData.description,
            difficulty: passageData.difficulty,
            questions: {
              create: questionIds.map((questionId, index) => ({
                questionId,
                sequence: index + 1,
              })),
            },
          },
        });
        console.log(`Created test: ${test.id}`);
      };

      // Create Test Part 1 (first 5 questions)
      console.log('Creating Test Part 1');
      await createTest(`${passageData.title} - Part 1`, questions.slice(0, 5).map(q => q.id));

      // Create Test Part 2 (remaining questions)
      if (questions.length > 5) {
        console.log('Creating Test Part 2');
        await createTest(`${passageData.title} - Part 2`, questions.slice(5).map(q => q.id));
      }

    } catch (error) {
      console.error(`Error processing passage ${passageData.title}:`, error);
    }
  }

  await prisma.$disconnect();
  console.log("Finished creating passages, questions, and tests.");
}

function parsePassagesAndQuestions(content: string): PassageWithQuestions[] {
    const passages: PassageWithQuestions[] = [];
    const passageRegex = /Title: (.+?) - (\d+)\n\nDescription: "(.+?)"\n\n(?:Caption|Citation): (.+?)\n\nPassage:\n([\s\S]+?)\nQuestions:/g;
    const questionRegex = /^(.+?)\((.+?),(\d+)\)\n([\s\S]+?)(?=\n\n(?:Title:|$))/gm;
  
    let passageMatch;
    let passageCount = 0;
    let totalQuestionCount = 0;
  
    while ((passageMatch = passageRegex.exec(content)) !== null) {
      passageCount++;
      const [, title, difficulty, description, citation, passageContent] = passageMatch;
      const questions: Question[] = [];
  
      console.log(`Parsing passage: ${title}`);
  
      let questionMatch;
      const questionContent = content.slice(passageMatch.index + passageMatch[0].length);
      while ((questionMatch = questionRegex.exec(questionContent)) !== null) {
        const [, questionText, conceptCategory, questionDifficulty, optionsText] = questionMatch;
        const options = optionsText.split('\n').map(opt => opt.trim().replace(/^\d+\.\s*/, ''));
        const correctAnswer = options.find(opt => opt.includes('(Correct)'))?.replace(' (Correct)', '') || '';
  
        questions.push({
          content: questionText.trim(),
          options: options.map(opt => opt.replace(' (Correct)', '')),
          correctAnswer,
          conceptCategory,
          contentCategory: 'CARs',
          difficulty: parseInt(questionDifficulty),
        });
      }
  
      totalQuestionCount += questions.length;
      console.log(`Parsed ${questions.length} questions for passage: ${title}`);
  
      passages.push({
        title,
        description,
        citation,
        content: passageContent.trim(),
        difficulty: parseInt(difficulty),
        questions,
      });
    }
  
    console.log(`Parsed ${passageCount} passages with a total of ${totalQuestionCount} questions`);
    return passages;
  }
    
  const inputFilePath = path.join(process.cwd(), 'data', 'passages_and_questions.txt');
  const fileContent = fs.readFileSync(inputFilePath, { encoding: 'utf-8' });
  const parsedData = parsePassagesAndQuestions(fileContent);
  
  console.log(`Parsed ${parsedData.length} passages with questions`);
  parsedData.forEach((passage, index) => {
    console.log(`Passage ${index + 1}: ${passage.title}`);
    console.log(`Number of questions: ${passage.questions.length}`);
  });

// Usage
console.log('Starting script');
//createPassagesQuestionsAndTests(true).catch(console.error);
function extractTitles(content: string): string[] {
  const titleRegex = /Title: (.+?) - \d+/g;
  const matches = content.match(titleRegex);
  
  if (!matches) return [];

  return matches.map(match => match.replace(/Title: (.+?) - \d+/, '$1'));
}

function extractDifficulties(content: string): number[] {
  const difficultyRegex = /Title: .+? - (\d+)/g;
  const matches = content.matchAll(difficultyRegex);
  
  if (!matches) return [];

  return Array.from(matches).map(match => parseInt(match[1], 10));
}

function extractDescriptions(content: string): string[] {
  const descriptionRegex = /^Description: (.+)$/gm;
  const matches = content.matchAll(descriptionRegex);
  
  if (!matches) return [];

  return Array.from(matches).map(match => match[1].trim());
}

function extractCitations(content: string): string[] {
  const citationRegex = /^Citation: (.+)$/gm;
  const matches = content.matchAll(citationRegex);
  
  if (!matches) return [];

  return Array.from(matches).map(match => match[1].trim());
}

function extractPassageTexts(content: string): string[] {
  const passageRegex = /Passage:([\s\S]*?)Questions:/g;
  const matches = content.matchAll(passageRegex);
  
  if (!matches) return [];

  return Array.from(matches).map(match => match[1].trim());
}
function extractQuestions(content: string): string[][] {
  const questionsRegex = /Questions:([\s\S]*?)(?=Title:|$)/g;
  const matches = content.matchAll(questionsRegex);
  
  if (!matches) return [];

  return Array.from(matches).map(match => {
    const questionBlock = match[1].trim();
    const lines = questionBlock.split('\n');
    
    let questionText = '';
    const questions = [];

    for (const line of lines) {
      if (!questionText && !/^\d+\./.test(line.trim())) {
        // Start collecting question text
        questionText = line.trim();
      } else if (questionText && !line.trim().startsWith('1.')) {
        // Continue collecting question text
        questionText += ' ' + line.trim();
      } else if (line.trim().startsWith('1.')) {
        // We've reached the start of answer options
        if (questionText.trim() !== '') {
          questions.push(questionText);
        }
        questionText = '';
      }
    }

    // Add the last question if there's any remaining
    if (questionText) {
      questions.push(questionText);
    }

    console.log("Questions for this passage:");
    questions.forEach((q, index) => {
      const letter = String.fromCharCode(65 + index);
      console.log(`${letter}. ${q}`);
    });
    console.log(); // Empty line for readability
    
    return questions;
  });
}
  
  function main() {
    const inputFilePath = path.join(process.cwd(), 'data', 'passages_and_questions.txt');
    console.log(`Reading file from: ${inputFilePath}`);
  
    try {
      const fileContent = fs.readFileSync(inputFilePath, { encoding: 'utf-8' });
      console.log('File content read successfully');
  
      const titles = extractTitles(fileContent);
      const difficulties = extractDifficulties(fileContent);
      const descriptions = extractDescriptions(fileContent);
      const citations = extractCitations(fileContent);
      const passageTexts = extractPassageTexts(fileContent);
      const questions = extractQuestions(fileContent);
      const totalPassages = titles.length;
  
      console.log('Passage Titles, Difficulties, Descriptions, Citations, Texts, and Questions:');
      const missingValues: string[] = [];
  
      titles.forEach((title, index) => {
        console.log(`${index + 1}. ${title} - Difficulty: ${difficulties[index] || 'Missing'}`);
        // console.log(`   Description: ${descriptions[index] || 'Missing'}`);
        // console.log(`   Citation: ${citations[index] || 'Missing'}`);
        // console.log(`   Passage Text: ${passageTexts[index] ? 'Present' : 'Missing'}`);
        console.log(`   Questions: ${questions[index] ? questions[index].length : 'Missing'}`);
  
        if (!difficulties[index]) missingValues.push(`Passage ${index + 1} is missing difficulty`);
        if (!descriptions[index]) missingValues.push(`Passage ${index + 1} is missing description`);
        if (!citations[index]) missingValues.push(`Passage ${index + 1} is missing citation`);
        if (!passageTexts[index]) missingValues.push(`Passage ${index + 1} is missing passage text`);
        if (!questions[index]) missingValues.push(`Passage ${index + 1} is missing questions`);
      });
  
      console.log(`Total number of passages: ${totalPassages}`);
  
      if (missingValues.length > 0) {
        console.log('\nMissing values:');
        missingValues.forEach(msg => console.log(msg));
      } else {
        console.log('\nAll passages have complete information.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  main()