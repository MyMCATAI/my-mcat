import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

async function getOrderedTests(userId: string, page: number, pageSize: number, CARSonly: boolean = false) {
  console.log(`Getting ordered tests for user ${userId}, page ${page}, pageSize ${pageSize}, CARSonly: ${CARSonly}`);
  const skip = (page - 1) * pageSize;
  console.log(`Calculated skip: ${skip}`);

  // Fetch user's knowledge profiles
  const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
    where: { userId },
    orderBy: { conceptMastery: 'asc' },
    include: { category: true }
  });
  console.log(`Fetched ${knowledgeProfiles.length} knowledge profiles`);

  // Fetch all categories
  let allCategories = await prisma.category.findMany();

  // Filter categories based on CARSonly option
  if (CARSonly) {
    allCategories = allCategories.filter(category => category.subjectCategory === "CARs");
  }

  // Combine knowledge profiles with categories
  const sortedCategories = allCategories.map(category => {
    const profile = knowledgeProfiles.find(p => p.categoryId === category.id);
    return {
      ...category,
      conceptMastery: profile ? profile.conceptMastery : null
    };
  });

  // Sort categories: those with profiles first (by conceptMastery), then those without
  sortedCategories.sort((a, b) => {
    if (a.conceptMastery === null && b.conceptMastery === null) return 0;
    if (a.conceptMastery === null) return 1;
    if (b.conceptMastery === null) return -1;
    return a.conceptMastery - b.conceptMastery;
  });

  // Fetch all tests with their categories
  const allTests = await prisma.test.findMany({
    where: CARSonly ? {
      questions: {
        some: {
          question: {
            contentCategory: {
              in: sortedCategories.map(c => c.contentCategory)
            }
          }
        }
      }
    } : {},
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      setName: true,
      _count: {
        select: { questions: true }
      },
      questions: {
        select: {
          question: {
            select: {
              contentCategory: true
            }
          }
        }
      }
    },
  });
  console.log(`Fetched ${allTests.length} tests`);

  // Fetch user's test history
  const userTests = await prisma.userTest.findMany({
    where: { userId },
    select: { testId: true, score: true }
  });
  console.log(`Fetched ${userTests.length} user test records`);

  // Create a map of test scores
  const userTestScores = new Map(userTests.map(test => [test.testId, test.score]));

  // Calculate relevance score for each test
  const testsWithRelevance = allTests.map(test => {
    const testCategories = test.questions.map(q => q.question.contentCategory);
    const uniqueCategories = Array.from(new Set(testCategories));
    
    const relevanceScore = uniqueCategories.reduce((score, category) => {
      const categoryProfile = sortedCategories.find(c => c.contentCategory === category);
      return score + (categoryProfile?.conceptMastery ?? 0);
    }, 0) / uniqueCategories.length;

    return {
      ...test,
      relevanceScore,
      taken: userTestScores.has(test.id)
    };
  });

  // Sort tests: untaken tests first (by relevance score), then taken tests (by relevance score)
  const sortedTests = testsWithRelevance.sort((a, b) => {
    if (!a.taken && !b.taken) return b.relevanceScore - a.relevanceScore;
    if (!a.taken) return -1;
    if (!b.taken) return 1;
    return b.relevanceScore - a.relevanceScore;
  });

  // Apply pagination
  const paginatedTests = sortedTests.slice(skip, skip + pageSize);
  console.log(`Applied pagination, returning ${paginatedTests.length} tests`);

  const totalPages = Math.ceil(allTests.length / pageSize);
  console.log(`Calculated total pages: ${totalPages}`);

  return {
    tests: paginatedTests.map(({ relevanceScore, taken, ...test }) => test),
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
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const testId = searchParams.get('id');
    const isDiagnostic = searchParams.get('diagnostic') === 'true';
    const CARSonly = searchParams.get('CARSonly') === 'true';

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
      // Fetch multiple tests using the new getOrderedTests function
      const testsData = await getOrderedTests(userId, page, pageSize, CARSonly);

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