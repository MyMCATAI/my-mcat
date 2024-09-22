import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export const getCategories = async (params: {
  page?: number;
  pageSize?: number;
}) => {
  const { page = 1, pageSize = 10 } = params;
  const skip = (page - 1) * pageSize;

  const categories = await prismadb.category.findMany({
    skip,
    take: pageSize,
    include: {
      questions: {
        select: {
          id: true,
          questionID: true,
          questionContent: true,
        }
      }
    }
  });

  const total = await prismadb.category.count();

  return {
    categories,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
  };
};

export const getCategoryById = async (id: string) => {
  const category = await prismadb.category.findUnique({
    where: { id },
    include: {
      questions: true,
    },
  });

  return category;
};

export const createCategory = async (data: {
  section: string;
  subjectCategory: string;
  contentCategory: string;
  conceptCategory: string;
  generalWeight: number;
}) => {
  // const { userId } = auth();
  // if (!userId) throw new Error("Unauthorized");

  const category = await prismadb.category.create({
    data: {
      ...data,
      generalWeight: parseFloat(data.generalWeight.toFixed(2))
    },
  });

  return category;
};

export const updateCategory = async (id: string, data: Partial<{
  section: string;
  subjectCategory: string;
  contentCategory: string;
  conceptCategory: string;
  generalWeight: number;
}>) => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const updateData = { ...data };
  if (updateData.generalWeight !== undefined) {
    updateData.generalWeight = parseFloat(updateData.generalWeight.toFixed(2));
  }

  const category = await prismadb.category.update({
    where: { id },
    data: updateData,
  });

  return category;
};

export const deleteCategory = async (id: string) => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await prismadb.category.delete({
    where: { id },
  });
};