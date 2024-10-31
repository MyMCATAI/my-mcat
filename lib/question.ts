// File: lib/question.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { Question, KnowledgeProfile, UserResponse } from '@prisma/client'; // Import types from Prisma


export const getQuestions = async (params: {
  categoryId?: string;
  passageId?: string;
  contentCategory?: string;
  conceptCategory?: string;
  page?: number;
  pageSize?: number;
  userId: string;
  difficulty?: number;
  types?: string;
  seenTimes: number;
  intervalTotalHours: number;
  intervalCorrectHours: number;
}) => {
  console.log('Params:', JSON.stringify(params));
  const { categoryId, passageId, contentCategory, conceptCategory, userId, difficulty, types, seenTimes, intervalTotalHours, intervalCorrectHours, page = 1, pageSize = 10 } = params;
  const skip = (page - 1) * pageSize;
  const maxRelevantIntervalHours = Math.max(intervalTotalHours, intervalCorrectHours);

  const where: any = {
    ...(categoryId && { categoryId }),
    ...(passageId && { passageId }),
    ...(contentCategory && { contentCategory }),
    ...(conceptCategory && { conceptCategory }),
    ...(difficulty && { difficulty }),
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