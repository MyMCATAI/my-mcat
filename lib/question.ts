// File: lib/question.ts

import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { Question, KnowledgeProfile, UserResponse } from '@prisma/client'; // Import types from Prisma
// import * as dfd from "danfojs-node";

export interface FlattenedQuestionResponse extends Question {  
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
  contentCategory?: string[];  
  conceptCategory?: string[]; 
  subjectCategory?: string[];  
  page?: number;
  pageSize?: number;
  userId: string;
  desiredDifficulty?: number;
  types?: string[];
  seenTimes?: number;
  intervalTotalHours?: number;
  intervalCorrectHours?: number;
  incorrectStreakProbWeight?: number;
  conceptContentMasteryProbWeight?: number;
  desiredDifficultyProbWeight?: number;
  testFrequencyProbWeight?: number;
}) => {
  console.log('Params:', JSON.stringify(params));
  const { categoryId, passageId, contentCategory, conceptCategory, subjectCategory, userId, desiredDifficulty, types, seenTimes = 3, intervalTotalHours = 72, intervalCorrectHours = 72, incorrectStreakProbWeight = 0.25,
    conceptContentMasteryProbWeight = 0.5,
    desiredDifficultyProbWeight = 0.05,
    testFrequencyProbWeight = 0.2,
    page = 1, 
    pageSize = 10 
  } = params;

  const maxRelevantIntervalHours = Math.max(intervalTotalHours, intervalCorrectHours);

  const where: any = {
    ...(categoryId && { categoryId }),
    ...(passageId && { passageId }),
    ...(types?.length && { 
      types: {
        in: types // Now correctly passing an array to the 'in' operator
      }
    }),
    // Modified category filters to use OR conditions when arrays have items
    category: {
      ...(contentCategory?.length && { 
        contentCategory: { in: contentCategory } 
      }),
      ...(conceptCategory?.length && { 
        conceptCategory: { in: conceptCategory } 
      }),
      ...(subjectCategory?.length && { 
        subjectCategory: { in: subjectCategory } 
      }),
    },
  };

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
      if (!question) {
        console.warn('Null/undefined question found in array');
        return null;
      }
      
      const matchedTuples = filteredResponses.filter((resp) => resp.id === question.id);

      // count the number of recent responses, this is to filter out the frequently seen questions
      const recentResponseCount = matchedTuples[0]?.userResponses?.filter(
        response => response.answeredAt >= new Date(Date.now() - params.intervalTotalHours! * 3600 * 1000)
      ).length || 0;
      const passesSeenTimes = recentResponseCount <= seenTimes;

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

      
      // handle the case where there is no knowledge profile
      const knowledgeProfile = question.category.knowledgeProfiles[0] || {
        id: '',
        userId: '',
        categoryId: '',
        correctAnswers: 0,
        totalAttempts: 0,
        lastAttemptAt: new Date(),
        conceptMastery: 0,
        contentMastery: 0.5,
      };

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
    }).filter((question): question is FlattenedQuestionResponse => question !== null);
  
    console.log('Hard filtered questions:', hardFilteredQuestions.length);

    // Scoring function for probabilistic question selection
    const questionScoringFunction = (questions: FlattenedQuestionResponse[]) => {      
      /* Commenting out dfd-based scoring
      // Helper function to safely normalize a Series
      const safeNormalize = (series: any) => {
        const maxVal = series.max();
        // If max is 0 or series is empty, return series of same length filled with 0s
        if (maxVal === 0 || maxVal === undefined) {
          return new dfd.Series(Array(series.size).fill(1));
        }
        return series.div(new dfd.Series(Array(series.size).fill(maxVal)));
      };

      // incorrect streak boost factor, normalize from 0-1
      const incorrectStreakBoostFactor = 2;
      const incorrectStreakScores = new dfd.Series(questions.map(q => q.incorrectStreak * incorrectStreakBoostFactor));
      const normalizedIncorrectStreakScores = safeNormalize(incorrectStreakScores);

      // concept mastery boost factor
      const conceptMasteryScores = new dfd.Series(questions.map(q => q.knowledge_conceptMastery ?? 0.5));
      const normalizedConceptMasteryScores = safeNormalize(conceptMasteryScores);
      
      // content mastery boost factor
      const contentMasteryScores = new dfd.Series(questions.map(q => q.knowledge_contentMastery ?? 0.5));
      const normalizedContentMasteryScores = safeNormalize(contentMasteryScores);

      // difficulty boost factor
      const desiredDifficultyScores = new dfd.Series(
        questions.map(q => q.difficulty === desiredDifficulty ? 1 : 0)
      );
      const normalizedDesiredDifficultyScores = safeNormalize(desiredDifficultyScores);

      // test Frequency boost factor
      const testFrequencyScores = new dfd.Series(questions.map(q => q.category_generalWeight));
      const normalizedtestFrequencyScores = safeNormalize(testFrequencyScores);

      // weighted probability vector
      return normalizedIncorrectStreakScores.mul(incorrectStreakProbWeight)
        .add(normalizedConceptMasteryScores.mul(conceptContentMasteryProbWeight/2))
        .add(normalizedContentMasteryScores.mul(conceptContentMasteryProbWeight/2))
        .add(normalizedDesiredDifficultyScores.mul(desiredDifficultyProbWeight))
        .add(normalizedtestFrequencyScores.mul(testFrequencyProbWeight));
      */
      
      // Temporary simplified scoring
      return questions.map(() => 1); // Equal weights for all questions
    }
    
    // Randomly select questions based on weights
    const probabilityWeights = questionScoringFunction(hardFilteredQuestions);
    // console.log('Probability weights:', dfd.toJSON(probabilityWeights)); // Comment out dfd.toJSON
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

    console.log('Random filtered questions:', selectRandomQuestions(hardFilteredQuestions, probabilityWeights, pageSize).length);

    // Create final response
    const totalQuestions = hardFilteredQuestions.length;
    const totalPages = Math.ceil(totalQuestions / pageSize);
    const selectedQuestions = selectRandomQuestions(hardFilteredQuestions, probabilityWeights, pageSize);

    return {
      questions: selectedQuestions.map(q => ({
        ...q,
        questionOptions: q.questionOptions.split('|'),
        context: q.context
      })),
      totalPages,
      currentPage: page,
    };

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

export const getQuestionsSimple = async (params: {
  contentCategory?: string[];
  conceptCategory?: string[];
  subjectCategory?: string[];
  userId: string;
  page?: number;
  pageSize?: number;
  types?: string[];
}) => {
  const { 
    contentCategory, 
    conceptCategory, 
    subjectCategory,
    types,
    userId,
    page = 1,
    pageSize = 10
  } = params;

  const where: any = {
    questionOptions: {
      not: '[]',
    },
    category: {
      ...(contentCategory?.length && { 
        contentCategory: { in: contentCategory } 
      }),
      ...(conceptCategory?.length && { 
        conceptCategory: { in: conceptCategory } 
      }),
      ...(subjectCategory?.length && { 
        subjectCategory: { in: subjectCategory } 
      }),
    },
    ...(types?.length && { 
      types: {
        in: types.flatMap(type => type.split(','))
      }
    }),
  };

  try {
    const questions = await prismadb.question.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        category: true,
        userResponses: {
          where: { userId },
          take: 1,
        },
      },
      orderBy: [
        {
          userResponses: {
            _count: 'asc'  // Questions with no responses first
          }
        },
        {
          id: 'asc'  // Consistent ordering as tiebreaker
        }
      ],
    });

    const totalQuestions = await prismadb.question.count({ where });
    const totalPages = Math.ceil(totalQuestions / pageSize);

    return {
      questions,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};