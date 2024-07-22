// File: lib/question.ts

import { auth } from "@clerk/nextjs"
import prismadb from "@/lib/prismadb"

export const getQuestions = async (params: {
  categoryId?: string;
  passageId?: string;
  page?: number;
  pageSize?: number;
}) => {
  const { categoryId, passageId, page = 1, pageSize = 10 } = params;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(categoryId && { categoryId }),
    ...(passageId && { passageId }),
  };

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
    questions,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
  };
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
  questionTitle: string;
  questionContent: string;
  questionOptions: any;
  questionAnswer: string;
  questionAnswerNotes: string;
  sectionCode: string;
  passageId?: string;
  categoryId: string;
}) => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const question = await prismadb.question.create({
    data,
  });

  return question;
};

export const updateQuestion = async (id: string, data: Partial<{
  questionTitle: string;
  questionContent: string;
  questionOptions: any;
  questionAnswer: string;
  questionAnswerNotes: string;
  sectionCode: string;
  passageId?: string;
  categoryId: string;
}>) => {
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