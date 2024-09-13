import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

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

console.log("Starting script");
//createPassagesQuestionsAndTests(true).catch(console.error);
function extractTitles(content: string): string[] {
  const titleRegex = /Title: (.+?) - \d+/g;
  const matches = content.match(titleRegex);

  if (!matches) return [];

  return matches.map((match) => match.replace(/Title: (.+?) - \d+/, "$1"));
}

function extractDifficulties(content: string): number[] {
  const difficultyRegex = /Title: .+? - (\d+)/g;
  const matches = content.matchAll(difficultyRegex);

  if (!matches) return [];

  return Array.from(matches).map((match) => parseInt(match[1], 10));
}

function extractDescriptions(content: string): string[] {
  const descriptionRegex = /^Description: (.+)$/gm;
  const matches = content.matchAll(descriptionRegex);

  if (!matches) return [];

  return Array.from(matches).map((match) => match[1].trim());
}

function extractCitations(content: string): string[] {
  const citationRegex = /^Citation: (.+)$/gm;
  const matches = content.matchAll(citationRegex);

  if (!matches) return [];

  return Array.from(matches).map((match) => match[1].trim());
}

function extractPassageTexts(content: string): string[] {
  const passageRegex = /Passage:([\s\S]*?)Questions:/g;
  const matches = content.matchAll(passageRegex);

  if (!matches) return [];

  return Array.from(matches).map((match) => match[1].trim());
}

function extractQuestions(content: string): [string, string[]][][] {
  const questionsRegex = /Questions:([\s\S]*?)(?=Title:|$)/g;
  const matches = content.matchAll(questionsRegex);

  if (!matches) return [];

  return Array.from(matches).map((match) => {
    const questionBlock = match[1].trim();
    const lines = questionBlock.split("\n");

    let questionText = "";
    let options: string[] = [];
    const questions: [string, string[]][] = [];

    for (const line of lines) {
      if (!questionText && !/^\d+\./.test(line.trim())) {
        // Start collecting question text
        questionText = line.trim();
      } else if (questionText && !line.trim().startsWith("1.")) {
        // Continue collecting question text
        questionText += " " + line.trim();
      } else if (/^\d+\./.test(line.trim())) {
        // We've reached an answer option
        if (line.trim().startsWith("1.")) {
          // If it's the first option, add the previous question and start new options
          if (questionText.trim() !== "") {
            questions.push([questionText.trim(), []]);
            questionText = "";
          }
          options = [];
        }
        // Remove the number and dot at the start of the option
        options.push(line.replace(/^\d+\.\s*/, "").trim());
        if (questions.length > 0) {
          // Rearrange options to put the correct answer first and remove (Correct) text
          const correctIndex = options.findIndex((opt) =>
            /\(correct\)/i.test(opt)
          );
          if (correctIndex !== -1) {
            const correctOption = options.splice(correctIndex, 1)[0];
            const cleanedCorrectOption = correctOption.replace(
              /\s*\(correct\)/i,
              ""
            );
            options.unshift(cleanedCorrectOption);
          }
          questions[questions.length - 1][1] = options;
        }
      }
    }

    // Add the last question if there's any remaining
    if (questionText.trim() !== "") {
      questions.push([questionText.trim(), options]);
    }

    return questions;
  });
}

function extractQuestionInfo(questionText: string): {
  cleanedText: string;
  conceptCategory: string;
  difficulty: number;
} {
  const regex = /^(.*?)\s*\(([^,]+),\s*(\d+)\)\s*(.*)$/;
  const match = questionText.match(regex);

  if (match) {
    const [, prefix, conceptCategory, difficultyStr, suffix] = match;
    const cleanedText = (prefix + " " + suffix).trim();
    const difficulty = parseInt(difficultyStr, 10);

    return {
      cleanedText,
      conceptCategory: conceptCategory.trim(),
      difficulty,
    };
  }

  // If no match found, attempt to extract information from the question text
  const fallbackRegex = /^(.*?)\s*\(([^,]+),\s*(\d+)\)$/;
  const fallbackMatch = questionText.match(fallbackRegex);

  if (fallbackMatch) {
    const [, cleanedText, conceptCategory, difficultyStr] = fallbackMatch;
    return {
      cleanedText: cleanedText.trim(),
      conceptCategory: conceptCategory.trim(),
      difficulty: parseInt(difficultyStr, 10),
    };
  }

  // If still no match, return original text and default values
  return {
    cleanedText: questionText,
    conceptCategory: "Unknown",
    difficulty: 0,
  };
}

async function createPassage(
  title: string,
  difficulty: number,
  description: string,
  citation: string,
  text: string
): Promise<string> {
  const existingPassage = await prisma.passage.findFirst({
    where: {
      title,
      difficulty,
    },
  });

  if (existingPassage) {
    return existingPassage.id;
  }

  const passage = await prisma.passage.create({
    data: {
      id: title.toLowerCase().replace(/\s+/g, "_"),
      title,
      description,
      citation,
      text,
      difficulty,
    },
  });
  return passage.id;
}

async function createTest(
  title: string,
  description: string,
  difficulty: number
): Promise<string> {
  const existingTest = await prisma.test.findFirst({
    where: {
      title,
      description,
      difficulty,
    },
  });

  if (existingTest) {
    return existingTest.id;
  }

  const test = await prisma.test.create({
    data: {
      title,
      description,
      difficulty,
    },
  });

  return test.id;
}

async function createQuestion(
  passageId: string,
  testId: string,
  content: string,
  options: string[],
  conceptCategory: string,
  difficulty: number,
  index: number
): Promise<string> {
  const category = await prisma.category.findFirst({
    where: {
      conceptCategory,
      contentCategory: "CARs",
    },
  });

  if (!category) {
    throw new Error(`Category not found for concept: ${conceptCategory}`);
  }

  const questionID = `CARs_${passageId}_${index + 1}`;
  const existingQuestion = await prisma.question.findFirst({
    where: {
      questionID,
      questionContent: content,
      questionOptions: JSON.stringify(options),
      contentCategory: "CARs",
      passageId,
      categoryId: category.id,
      difficulty,
    },
  });

  if (existingQuestion) {
    // Check if TestQuestion relationship already exists
    const existingTestQuestion = await prisma.testQuestion.findFirst({
      where: {
        testId,
        questionId: existingQuestion.id,
      },
    });

    if (!existingTestQuestion) {
      // Create the TestQuestion relationship if it doesn't exist
      await prisma.testQuestion.create({
        data: {
          testId,
          questionId: existingQuestion.id,
          sequence: index + 1,
        },
      });
    }

    return existingQuestion.id;
  }

  const question = await prisma.question.create({
    data: {
      questionID,
      questionContent: content,
      questionOptions: JSON.stringify(options),
      questionAnswerNotes: "",
      contentCategory: "CARs",
      passageId,
      categoryId: category.id,
      difficulty,
    },
  });

  // Create the TestQuestion relationship
  await prisma.testQuestion.create({
    data: {
      testId,
      questionId: question.id,
      sequence: index + 1,
    },
  });

  return question.id;
}

async function main(startIndex: number = 0, processCount: number = 1) {
  const inputFilePath = path.join(
    process.cwd(),
    "data",
    "passages_and_questions.txt"
  );
  console.log(`Reading file from: ${inputFilePath}`);

  try {
    const fileContent = fs.readFileSync(inputFilePath, { encoding: "utf-8" });
    console.log("File content read successfully");

    const titles = extractTitles(fileContent);
    const difficulties = extractDifficulties(fileContent);
    const descriptions = extractDescriptions(fileContent);
    const citations = extractCitations(fileContent);
    const passageTexts = extractPassageTexts(fileContent);
    const questions = extractQuestions(fileContent);

    const endIndex = Math.min(startIndex + processCount, titles.length);
    console.log(
      `Processing passages from index ${startIndex} to ${endIndex - 1}`
    );

    for (let i = startIndex; i < endIndex; i++) {
      const passageId = await createPassage(
        titles[i],
        difficulties[i],
        descriptions[i],
        citations[i],
        passageTexts[i]
      );
      console.log(`Created passage: ${passageId}`);

      // Create Test Part 1
      const testId1 = await createTest(
        `${titles[i]} - Part 1`,
        descriptions[i],
        difficulties[i]
      );
      console.log(`Created test part 1: ${testId1}`);

      // Create Test Part 2 if there are more than 5 questions
      let testId2 = null;
      if (questions[i].length > 5) {
        testId2 = await createTest(
          `${titles[i]} - Part 2`,
          descriptions[i],
          difficulties[i]
        );
        console.log(`Created test part 2: ${testId2}`);
      }

      // Create questions and associate them with the appropriate test
      for (let j = 0; j < questions[i].length; j++) {
        const [questionText, options] = questions[i][j];
        const { cleanedText, conceptCategory, difficulty } =
          extractQuestionInfo(questionText);
        const currentTestId = j < 5 ? testId1 : testId2;
        if (currentTestId) {
          const questionId = await createQuestion(
            passageId,
            currentTestId,
            cleanedText,
            options,
            conceptCategory,
            difficulty,
            j
          );
          console.log(
            `Created question: ${questionId} for test: ${currentTestId}`
          );
        }
      }
    }

    console.log("Finished creating passages, tests, and questions.");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Usage examples:
// To process only the first passage (default behavior):
// main().catch(console.error);

// To skip the first passage and process the next one:
// main(1, 1).catch(console.error);

// To process all passages starting from the second one:
// main(1).catch(console.error);

// To process a specific number of passages starting from a specific index:
// main(2, 3).catch(console.error);  // Process 3 passages starting from index 2

// Uncomment the line you want to use:
main(0, 25).catch(console.error); // This will process the second passage
