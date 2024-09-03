import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";


async function getOrderedTests(userId: string, page: number, pageSize: number) {
  console.log(`Getting ordered tests for user ${userId}, page ${page}, pageSize ${pageSize}`);
  const skip = (page - 1) * pageSize;
  console.log(`Calculated skip: ${skip}`);

  // TODO: Fetch user's test history and performance data
  // This should include timestamps of when tests were taken and scores for each question category

  // Fetch all tests
  const allTests = await prisma.test.findMany({
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
  console.log(`Fetched ${allTests.length} tests`);

  // TODO: Fetch additional data for each test:
  // - Question categories
  // - Passage difficulty scores

  // Fetch user's test history
  const userTests = await prisma.userTest.findMany({
    where: { userId },
    select: { testId: true, score: true }
  });
  console.log(`Fetched ${userTests.length} user test records`);

  // TODO: Analyze user's performance across different categories

  // Create a map of test scores
  const userTestScores = new Map(userTests.map(test => [test.testId, test.score]));
  console.log(`Created map of user test scores with ${userTestScores.size} entries`);

  // TODO: Implement new sorting algorithm based on relevance score
  // This should replace the current sorting logic
  const sortedTests = allTests.sort((a, b) => {
    const scoreA = userTestScores.get(a.id);
    const scoreB = userTestScores.get(b.id);

    console.log(`Comparing test ${a.id} (score: ${scoreA}) with test ${b.id} (score: ${scoreB})`);

    // Tests not taken come first
    if (scoreA === undefined && scoreB === undefined) return 0;
    if (scoreA === undefined) return -1;
    if (scoreB === undefined) return 1;

    // Then sort by lowest score
    return (scoreA ?? 0) - (scoreB ?? 0);
  });
  console.log(`Sorted ${sortedTests.length} tests`);

  // Apply pagination
  const paginatedTests = sortedTests.slice(skip, skip + pageSize);
  console.log(`Applied pagination, returning ${paginatedTests.length} tests`);

  const totalPages = Math.ceil(allTests.length / pageSize);
  console.log(`Calculated total pages: ${totalPages}`);

  // TODO: Consider adding more information to the returned object,
  // like as reasons why each test was recommended

  return {
    tests: paginatedTests,
    totalPages: totalPages,
    currentPage: page,
  };
}

export async function GET(req: Request) {
  console.log("GET request tests");

  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    console.log("ordered: ", searchParams.get('ordered'));

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const testId = searchParams.get('id');
    const isDiagnostic = searchParams.get('diagnostic') === 'true';
    const isOrdered = searchParams.get('ordered') === 'true';

    if (isDiagnostic) {
      // Return the diagnostic test ID
      return new NextResponse(JSON.stringify({ testId: 'clzikfkwt0000b3k9qtcfz7ko' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (testId) {
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
      let testsData;

      if (isOrdered) {
        testsData = await getOrderedTests(userId, page, pageSize);
      } else {
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

        testsData = {
          tests,
          totalPages: Math.ceil(totalTests / pageSize),
          currentPage: page,
        };
      }

      return new NextResponse(JSON.stringify(testsData), { 
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