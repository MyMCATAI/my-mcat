import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const testId = searchParams.get('id');

    if (testId) {
      // Fetch a single test by ID with its questions
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          questions: {
            include: {
              question: {
                select: {
                  id: true,
                  questionID: true,
                  questionContent: true,
                  questionOptions: true,
                  questionAnswerNotes: true,
                  contentCategory: true,
                  passageId: true
                }
              }
            }
          },
        }
      });

      if (!test) {
        return new NextResponse(JSON.stringify({ error: "Test not found" }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new NextResponse(JSON.stringify(test), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Fetch multiple tests
      const skip = (page - 1) * pageSize;

      const tests = await prisma.test.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          setName: true,
          _count: {
            select: { questions: true }
          }
        },
      });

      const totalTests = await prisma.test.count();

      return new NextResponse(JSON.stringify({
        tests,
        totalPages: Math.ceil(totalTests / pageSize),
        currentPage: page,
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('[TESTS_GET]', error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      title, 
      description, 
      setName, 
      section, 
      subjectCategory, 
      contentCategory, 
      conceptCategory,
      numberOfQuestions
    } = body;

    if (!title || !description || !setName) {
      return new NextResponse(JSON.stringify({ error: "Invalid input" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create a new test
    const newTest = await prisma.test.create({
      data: {
        title,
        description,
        setName,
      },
    });

    // Prepare category filter
    const categoryFilter: any = {};
    if (section) categoryFilter.section = section;
    if (subjectCategory) categoryFilter.subjectCategory = subjectCategory;
    if (contentCategory) categoryFilter.contentCategory = contentCategory;
    if (conceptCategory) categoryFilter.conceptCategory = conceptCategory;

    // Fetch matching categories
    const categories = await prisma.category.findMany({
      where: categoryFilter,
    });

    // If no matching categories found, use all categories
    const allCategories = categories.length > 0 ? categories : await prisma.category.findMany();

    // Determine number of questions to add
    const questionsToAdd = numberOfQuestions || allCategories.length;

    // Add questions to the test
    for (let i = 0; i < questionsToAdd; i++) {
      const category = allCategories[i % allCategories.length];
      const randomQuestion = await prisma.question.findFirst({
        where: { categoryId: category.id },
        orderBy: { id: 'asc' }, // You might want to use a more sophisticated randomization method
        select: { id: true },
      });

      if (randomQuestion) {
        await prisma.testQuestion.create({
          data: {
            testId: newTest.id,
            questionId: randomQuestion.id,
            sequence: i + 1,
          },
        });
      }
    }

    // Fetch the created test with its questions
    const createdTest = await prisma.test.findUnique({
      where: { id: newTest.id },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                questionID: true,
                questionContent: true,
                questionOptions: true,
                questionAnswerNotes: true,
                contentCategory: true,
                passageId: true,
                category: {
                  select: {
                    section: true,
                    subjectCategory: true,
                    contentCategory: true,
                    conceptCategory: true,
                  }
                }
              }
            }
          }
        },
      }
    });

    return new NextResponse(JSON.stringify(createdTest), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[TESTS_POST]', error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}