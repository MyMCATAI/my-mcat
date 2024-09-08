import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

interface AnswerOption {
  text: string;
  explanation: string;
}

interface Question {
  content: string;
  relevantContext: string;
  correctAnswer: AnswerOption;
  incorrectAnswers: AnswerOption[];
  conceptCategory: string;
  contentCategory: string;
  difficulty: number;
}

console.log('Starting script');

function extractTitles(content: string): string[] {
  const titleRegex = /^Title: (.+)$/gm;
  const matches = content.match(titleRegex);
  
  if (!matches) return [];

  return matches.map(match => match.replace(/^Title: /, '').trim());
}

function extractQuestions(content: string): Question[] {
  const questionRegex = /Q\d+:[\s\S]*?(?=Q\d+:|$)/g;
  const questionMatches = content.match(questionRegex) || [];

  return questionMatches.map(questionText => {
    const relevantContextMatch = questionText.match(/Relevant Context:([\s\S]*?)(?=Correct Answer:|$)/);
    const tipMatch = questionText.match(/Tip for [Aa]nswering [Ss]imilar [Qq]uestions:([\s\S]*?)(?=Q\d+:|$)/);
    const correctAnswerMatch = questionText.match(/Correct Answer:([\s\S]*?)Explanation:([\s\S]*?)(?=Incorrect Answer:|Tip for [Aa]nswering [Ss]imilar [Qq]uestions:|$)/s);
    const incorrectAnswersMatch = questionText.match(/Incorrect Answer:([\s\S]*?)Explanation:([\s\S]*?)(?=Incorrect Answer:|Tip for [Aa]nswering [Ss]imilar [Qq]uestions:|$)/g);

    let relevantContext = relevantContextMatch ? relevantContextMatch[1].trim() : '';
    if (tipMatch) {
      relevantContext += '\n\nTip for Answering Similar Questions:' + tipMatch[1].trim();
    }

    const correctAnswer: AnswerOption = correctAnswerMatch 
      ? { text: correctAnswerMatch[1].trim(), explanation: correctAnswerMatch[2].trim() }
      : { text: '', explanation: '' };

    const incorrectAnswers: AnswerOption[] = incorrectAnswersMatch
      ? incorrectAnswersMatch.map(answer => {
          const [answerText, explanation] = answer.split(/Explanation:/);
          return {
            text: answerText.replace(/Incorrect Answer:/, '').trim(),
            explanation: explanation ? explanation.trim() : ''
          };
        })
      : [];

    return {
      content: questionText.split('\n')[0].trim(),
      relevantContext,
      correctAnswer,
      incorrectAnswers,
      conceptCategory: '',
      contentCategory: '',
      difficulty: 0
    };
  });
}

function validatePassage(title: string, questions: Question[]) {
  let hasMissingComponents = false;

  if (questions.length !== 10) {
    console.log(`Passage "${title}" has ${questions.length} questions instead of 10.`);
    hasMissingComponents = true;
  }

  questions.forEach((question, index) => {
    if (!question.relevantContext) {
      console.log(`Question ${index + 1} in passage "${title}" is missing context.`);
      hasMissingComponents = true;
    }
    if (!question.correctAnswer.text || !question.correctAnswer.explanation) {
      console.log(`Question ${index + 1} in passage "${title}" is missing correct answer or its explanation.`);
      hasMissingComponents = true;
    }
    if (question.incorrectAnswers.length !== 3) {
      console.log(`Question ${index + 1} in passage "${title}" has ${question.incorrectAnswers.length} incorrect answers instead of 3.`);
      hasMissingComponents = true;
    }
    question.incorrectAnswers.forEach((answer, answerIndex) => {
      if (!answer.text || !answer.explanation) {
        console.log(`Incorrect answer ${answerIndex + 1} for question ${index + 1} in passage "${title}" is missing text or explanation.`);
        hasMissingComponents = true;
      }
    });
  });

  if (hasMissingComponents) {
    console.log(`Questions for passage "${title}":`);
    questions.forEach((question, index) => {
      console.log(`Q${index + 1}: ${question.content}`);
    });
    console.log(''); // Add a blank line for readability
  }
}

async function updatePassageQuestions(title: string, extractedQuestions: Question[]) {
  const passage = await prisma.passage.findFirst({
    where: { title: title },
    include: { questions: true }
  });

  if (!passage) {
    console.log(`Passage "${title}" not found in the database.`);
    return;
  }

  for (const extractedQuestion of extractedQuestions) {
    const matchingQuestion = passage.questions.find(q => {
      const normalizeText = (text: string) => {
        return text.toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
          .replace(/[''"']/g, "'")
          .replace(/[""]/, '"')
          .trim();
      };
      const dbOption = normalizeText(JSON.parse(q.questionOptions)[0]);
      const extractedOption = normalizeText(extractedQuestion.correctAnswer.text);
      
      return dbOption === extractedOption;
    });

    if (matchingQuestion) {
      // Check if questionAnswerNotes already exists
      if (matchingQuestion.questionAnswerNotes) {
        // console.log(`Skipping question ${matchingQuestion.id} as it already has answer notes.`);
        continue;
      }

      const updatedOptions = [
        extractedQuestion.correctAnswer.text,
        ...extractedQuestion.incorrectAnswers.map(a => a.text)
      ];

      const updatedAnswerNotes = [
        extractedQuestion.correctAnswer.explanation,
        ...extractedQuestion.incorrectAnswers.map(a => a.explanation)
      ];

      await prisma.question.update({
        where: { id: matchingQuestion.id },
        data: {
          questionOptions: JSON.stringify(updatedOptions),
          questionAnswerNotes: JSON.stringify(updatedAnswerNotes),
          context: extractedQuestion.relevantContext
        }
      });

      console.log(`Updated question: ${matchingQuestion.id}`);
    } else {
      console.log(`No matching question found for correct answer: ${extractedQuestion.correctAnswer.text}`);
    }
  }
}

async function main() {
  const inputFilePath = path.join(process.cwd(), 'data', 'explanations.txt');
  console.log(`Reading file from: ${inputFilePath}`);

  try {
    const fileContent = fs.readFileSync(inputFilePath, { encoding: 'utf-8' });
    console.log('File content read successfully');

    const titles = extractTitles(fileContent);
    
    console.log('Processing titles and questions:');
    const titleRegex = /^Title: (.+)$/gm;
    const passages = fileContent.split(titleRegex).slice(1);

    for (let i = 0; i < passages.length; i += 2) {
      const title = passages[i].trim();
      const passageContent = passages[i + 1];
      const questions = extractQuestions(passageContent);
      
      await updatePassageQuestions(title, questions);
    }

    console.log('Finished processing all passages and questions.');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);