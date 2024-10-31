// File: lib/question.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { Question, KnowledgeProfile, UserResponse } from '@prisma/client'; // Import types from Prisma




interface FlattenedQuestionResponse extends Question {  
  // Category fields (prefixed with category_)
  category_id: string;
  category_subjectCategory: string;
  category_contentCategory: string;
  category_conceptCategory: string;
  category_generalWeight: number;
  category_section: string;
  category_color: string;
  category_icon: string;
  
  // Knowledge Profile fields (prefixed with knowledge_)
  knowledge_id: string;
  knowledge_userId: string;
  knowledge_categoryId: string;
  knowledge_correctAnswers: number;
  knowledge_totalAttempts: number;
  knowledge_lastAttemptAt: Date;
  knowledge_conceptMastery: number | null;
  knowledge_contentMastery: number | null;
  
  // Additional computed fields
  passesSeenTimes: boolean;
  passesCorrectTimes: boolean;
  incorrectStreak: number;
}



export const getQuestions = async (params: {
  categoryId?: string;
  passageId?: string;
  contentCategory?: string;
  conceptCategory?: string;
  page?: number;
  pageSize?: number;
  userId: string;
  desiredDifficulty?: number;
  types?: string;
  seenTimes?: number;
  intervalTotalHours?: number;
  intervalCorrectHours?: number;
  incorrectStreakProbWeight?: number;
  conceptContentMasteryProbWeight?: number;
  desiredDifficultyProbWeight?: number;
  testFrequencyProbWeight?: number;
}) => {
  console.log('Params:', JSON.stringify(params));
  const { categoryId, passageId, contentCategory, conceptCategory, userId, desiredDifficulty, types, seenTimes = 3, intervalTotalHours = 72, intervalCorrectHours = 72, incorrectStreakProbWeight = 0.25,
    conceptContentMasteryProbWeight = 0.5,
    desiredDifficultyProbWeight = 0.05,
    testFrequencyProbWeight = 0.2,
    page = 1, 
    pageSize = 10 
  } = params;
  const skip = (page - 1) * pageSize;
  const maxRelevantIntervalHours = Math.max(intervalTotalHours, intervalCorrectHours);

  const where: any = {
    ...(categoryId && { categoryId }),
    ...(passageId && { passageId }),
    ...(contentCategory && { contentCategory }),
    ...(conceptCategory && { conceptCategory }),
    ...(types && { types }),
  };
  console.log('Where clause:', JSON.stringify(where));

  try {
    const questions = await prismadb.question.findMany({
      where,
      include: {
        category: { // join the knowledge profiles indirecty through category
          include: {
            knowledgeProfiles: {
              where: {
                userId: userId, // filter the knowledge profiles that belong to the user
              },
            },
          },
        },
      },
    });

    const filteredResponses = await prismadb.question.findMany({ 
      where,
      include: {
        category: { // join the knowledge profiles indirecty through category
          include: {
            knowledgeProfiles: {
              where: {
                userId: userId, // filter the knowledge profiles that belong to the user
              },
            },
          },
        },
        userResponses: {
          where: {
            answeredAt: {
              gte: new Date(Date.now() - maxRelevantIntervalHours * 3600 * 1000), // Filter based on elapsed hours
            },
          }
        },
      },
    });

    // implement hard filters
    // also takes care of the flattening logic
    const hardFilteredQuestions: FlattenedQuestionResponse[] = questions.map((question) => {
      const matchedTuples = filteredResponses.filter((resp) => resp.id === question.id);

      // count the number of recent responses, this is to filter out the frequently seen questions
      const recentResponseCount = matchedTuples[0]?.userResponses?.filter(
        response => response.answeredAt >= new Date(Date.now() - params.intervalTotalHours! * 3600 * 1000)
      ).length || 0;
      const passesSeenTimes = recentResponseCount >= seenTimes;

      // filter out the questions that are answered correctly recently
      const recentCorrectResponseCount = matchedTuples[0]?.userResponses?.filter(
        response => response.isCorrect && 
        response.answeredAt >= new Date(Date.now() - params.intervalCorrectHours! * 3600 * 1000)
      ).length || 0;
      const passesCorrectTimes = recentCorrectResponseCount < 1;

      // Count incorrect responses since last correct (or all incorrect if no correct found)
      const sortedResponses = matchedTuples[0]?.userResponses?.sort(
        (a, b) => b.answeredAt.getTime() - a.answeredAt.getTime()
      ) || [];
      const lastCorrectIndex = sortedResponses.findIndex(response => response.isCorrect);
      const incorrectStreak = lastCorrectIndex === -1 
        ? sortedResponses.filter(response => !response.isCorrect).length
        : sortedResponses.slice(0, lastCorrectIndex).filter(response => !response.isCorrect).length;      


      const knowledgeProfile = question.category.knowledgeProfiles[0]; // Assuming we always take the first profile

      return {
        // Base Question fields
        id: question.id,
        questionContent: question.questionContent,
        questionOptions: question.questionOptions,
        questionAnswerNotes: question.questionAnswerNotes,
        context: question.context,
        passageId: question.passageId,
        categoryId: question.categoryId,
        contentCategory: question.contentCategory,
        questionID: question.questionID,
        difficulty: question.difficulty,
        links: question.links,
        tags: question.tags,
        types: question.types,
        states: question.states,
        contentId: question.contentId,
        
        // Category fields
        category_id: question.category.id,
        category_subjectCategory: question.category.subjectCategory,
        category_contentCategory: question.category.contentCategory,
        category_conceptCategory: question.category.conceptCategory,
        category_generalWeight: question.category.generalWeight,
        category_section: question.category.section,
        category_color: question.category.color,
        category_icon: question.category.icon,
        
        // Knowledge Profile fields
        knowledge_id: knowledgeProfile.id,
        knowledge_userId: knowledgeProfile.userId,
        knowledge_categoryId: knowledgeProfile.categoryId,
        knowledge_correctAnswers: knowledgeProfile.correctAnswers,
        knowledge_totalAttempts: knowledgeProfile.totalAttempts,
        knowledge_lastAttemptAt: knowledgeProfile.lastAttemptAt,
        knowledge_conceptMastery: knowledgeProfile.conceptMastery,
        knowledge_contentMastery: knowledgeProfile.contentMastery,
        
        // Additional computed fields
        passesSeenTimes,
        passesCorrectTimes,
        incorrectStreak,
      }
    }).filter(question => question.passesSeenTimes && question.passesCorrectTimes);
  

    // Scoring function for probabilistic question selection
    const questionScoringFunction = (questions: FlattenedQuestionResponse[]) => {
      const dfd = require("danfojs-node");
      
      // incorrect streak boost factor, normalize from 0-1
      const incorrectStreakBoostFactor = 2;
      const incorrectStreakScores = new dfd.Series(questions.map(q => q.incorrectStreak * incorrectStreakBoostFactor));
      const normalizedIncorrectStreakScores = incorrectStreakScores.div(incorrectStreakScores.max());

      // concept mastery boost factor
      const conceptMasteryScores = new dfd.Series(questions.map(q => q.knowledge_conceptMastery ?? 0.5));
      const normalizedConceptMasteryScores = conceptMasteryScores.div(conceptMasteryScores.max());
      
      // content mastery boost factor
      const contentMasteryScores = new dfd.Series(questions.map(q => q.knowledge_contentMastery ?? 0.5));
      const normalizedContentMasteryScores = contentMasteryScores.div(contentMasteryScores.max());

      // difficulty boost factor
      const desiredDifficultyScores = desiredDifficulty === null 
        ? new dfd.Series(questions.map(() => 0)) // Vector of 0s if desiredDifficulty is null
        : new dfd.Series(questions.map(q => q.difficulty === desiredDifficulty ? 1 : 0));
      const normalizedDesiredDifficultyScores = desiredDifficultyScores.div(desiredDifficultyScores.max());

      // test Frequency  boost factor
      const testFrequencyScores = new dfd.Series(questions.map(q => q.category_generalWeight));
      const normalizedtestFrequencyScores = testFrequencyScores.div(testFrequencyScores.max());

      // weighted probability vector
      const weightedProbabilityVector = normalizedIncorrectStreakScores.mul(incorrectStreakProbWeight)
      .add(normalizedConceptMasteryScores.mul(conceptContentMasteryProbWeight/2))
      .add(normalizedContentMasteryScores.mul(conceptContentMasteryProbWeight/2))
      .add(normalizedDesiredDifficultyScores.mul(desiredDifficultyProbWeight))
      .add(normalizedtestFrequencyScores.mul(testFrequencyProbWeight));

      return weightedProbabilityVector;
    }
    
    // Randomly select questions based on weights
    const probabilityWeights = questionScoringFunction(hardFilteredQuestions);
    const selectRandomQuestions = (questions: FlattenedQuestionResponse[], weights: any, count: number) => {
      const selected = new Set();
      const totalWeight = weights.values.reduce((a: number, b: number) => a + b, 0);
      
      while (selected.size < count && selected.size < questions.length) {
        let r = Math.random() * totalWeight;
        let sum = 0;
        
        for (let i = 0; i < questions.length; i++) {
          if (selected.has(i)) continue;
          
          sum += weights.values[i];
          if (r <= sum) {
            selected.add(i);
            break;
          }
        }
      }
      return Array.from(selected).map(index => questions[index as number]);
    }
    

    // choose questions based on the scoring function
    const selectedQuestions = hardFilteredQuestions.map((question) => {
      const score = questionScoringFunction([question]);
      return { ...question, score };
    }).sort((a, b) => b.score - a.score).slice(0, pageSize);


    












    return questions.map((question) => {
      const matchedTuples = filteredResponses.filter((resp) => resp.id === question.id);

      // count the number of recent responses, this is to filter out the frequently seen questions
      const recentResponseCount = matchedTuples[0]?.userResponses?.filter(
        response => response.answeredAt >= new Date(Date.now() - params.intervalTotalHours * 3600 * 1000)
      ).length || 0;
      const passesSeenTimes = recentResponseCount >= seenTimes;

      // filter out the questions that are answered correctly recently
      const recentCorrectResponseCount = matchedTuples[0]?.userResponses?.filter(
        response => response.isCorrect && 
        response.answeredAt >= new Date(Date.now() - params.intervalCorrectHours * 3600 * 1000)
      ).length || 0;
      const passesCorrectTimes = recentCorrectResponseCount < 1;

      // Count incorrect responses since last correct (or all incorrect if no correct found)
      const sortedResponses = matchedTuples[0]?.userResponses?.sort(
        (a, b) => b.answeredAt.getTime() - a.answeredAt.getTime()
      ) || [];
      const lastCorrectIndex = sortedResponses.findIndex(response => response.isCorrect);
      const incorrectStreak = lastCorrectIndex === -1 
        ? sortedResponses.filter(response => !response.isCorrect).length
        : sortedResponses.slice(0, lastCorrectIndex).filter(response => !response.isCorrect).length;      

        return {
          ...question,
          passesSeenTimes,
          passesCorrectTimes,
          incorrectStreak,
        }
    }).filter(question => question.passesSeenTimes && question.passesCorrectTimes); // Filter out hard removals




    if (conceptCategory) {
      const category = await prismadb.category.findFirst({
        where,
        include: {
          questions: {
            where,
            include: {
              passage: true,
            },
            skip,
            take: pageSize,
          },
        },
      });

      const total = await prismadb.question.count({
        where: {
          ...where,
          category: { conceptCategory },
        },
      });

      return {
        category: {
          ...category,
          questions: category?.questions.map(q => ({
            ...q,
            questionOptions: q.questionOptions.split('|'),
            context: q.context // Ensure context is included
          })) || [],
        },
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      };
    } else {
      const questions = await prismadb.question.findMany({
        where,
        include: {
          passage: true,
          category: true,
        },
        skip,
        take: pageSize,
      });

      const total = await prismadb.question.count({ where });

      return {
        questions: questions.map(q => ({
          ...q,
          questionOptions: q.questionOptions.split('|'),
          context: q.context // Ensure context is included
        })),
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      };
    }
  } catch (error) {
    console.error('Error in getQuestions:', error);
    throw error;
  }
};

export const getQuestionById = async (id: string) => {
  const question = await prismadb.question.findUnique({
    where: { id },
    include: {
      passage: true,
      category: true,
    },
  });

  return question;
};

export const createQuestion = async (data: {
  questionID: string;
  questionContent: string;
  questionOptions: string;
  questionAnswerNotes?: string;
  contentCategory: string;
  passageId?: string;
  categoryId: string;
}) => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const question = await prismadb.question.create({
    data: {
      questionID: data.questionID,
      questionContent: data.questionContent,
      questionOptions: data.questionOptions,
      questionAnswerNotes: data.questionAnswerNotes,
      contentCategory: data.contentCategory,
      passageId: data.passageId,
      categoryId: data.categoryId,
    },
  });

  return question;
};

export const updateQuestion = async (id: string, data: {
  questionContent?: string;
  questionOptions?: string;
  questionAnswerNotes?: string;
  contentCategory?: string;
  passageId?: string;
  categoryId?: string;
}) => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const question = await prismadb.question.update({
    where: { id },
    data,
  });

  return question;
};

export const deleteQuestion = async (id: string) => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await prismadb.question.delete({
    where: { id },
  });
};