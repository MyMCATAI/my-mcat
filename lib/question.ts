// File: lib/question.ts

import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export const getQuestions = async (params: {
  categoryId?: string;
  passageId?: string;
  contentCategory?: string;
  conceptCategory?: string;
  page?: number;
  pageSize?: number;
}) => {
  console.log('Params:', JSON.stringify(params));
  const { categoryId, passageId, contentCategory, conceptCategory, page = 1, pageSize = 10 } = params;
  const skip = (page - 1) * pageSize;

  const where: any = {
    ...(categoryId && { categoryId }),
    ...(passageId && { passageId }),
    ...(contentCategory && { contentCategory }),
  };
  console.log('Where clause:', JSON.stringify(where));

  try {
    if (conceptCategory) {
      const category = await prismadb.category.findFirst({
        where: { conceptCategory },
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
            questionOptions: q.questionOptions.split('|')
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
          questionOptions: q.questionOptions.split('|')
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