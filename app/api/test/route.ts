import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

type ConceptCategory = {
  name: string;
  averageScore: number;
  contentCategories: string[];
};

async function getOrderedTests(
  userId: string,
  page: number,
  pageSize: number,
  CARSonly: boolean = false
) {
  console.log(
    `Getting ordered tests for user ${userId}, page ${page}, pageSize ${pageSize}, CARSonly: ${CARSonly}`
  );
  const skip = (page - 1) * pageSize;

  // Fetch user's knowledge profiles
  const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
    where: {
      userId,
      ...(CARSonly && { category: { subjectCategory: "CARs" } }),
    },
    include: { category: true },
  });
  console.log(`Fetched ${knowledgeProfiles.length} knowledge profiles`);

  // Calculate average scores for each concept category and collect content categories
  const conceptCategories: {
    [key: string]: ConceptCategory & { count: number };
  } = {};
  const userContentCategories = new Set<string>();
  knowledgeProfiles.forEach((profile) => {
    const { conceptCategory, contentCategory } = profile.category;
    if (!conceptCategories[conceptCategory]) {
      conceptCategories[conceptCategory] = {
        name: conceptCategory,
        averageScore: 0,
        count: 0,
        contentCategories: [],
      };
    }
    if (profile.conceptMastery !== null) {
      conceptCategories[conceptCategory].averageScore += profile.conceptMastery;
      conceptCategories[conceptCategory].count++;
    }
    if (
      !conceptCategories[conceptCategory].contentCategories.includes(
        contentCategory
      )
    ) {
      conceptCategories[conceptCategory].contentCategories.push(
        contentCategory
      );
    }
    userContentCategories.add(contentCategory);
  });

  // Calculate final average scores and sort categories
  const sortedConceptCategories = Object.values(conceptCategories)
    .map((category) => ({
      name: category.name,
      averageScore:
        category.count > 0 ? category.averageScore / category.count : 0,
      contentCategories: category.contentCategories,
    }))
    .sort((a, b) => a.averageScore - b.averageScore);

  console.log("Sorted concept categories:", sortedConceptCategories);
  console.log("User content categories:", Array.from(userContentCategories));

  // Fetch all available tests
  let testQuery: any = {};
  if (CARSonly && userContentCategories.size > 0) {
    testQuery = {
      questions: {
        some: {
          question: {
            contentCategory: {
              in: Array.from(userContentCategories),
            },
          },
        },
      },
    };
  }

  console.log("Test query:", JSON.stringify(testQuery, null, 2));

  const allTests = await prisma.test.findMany({
    where: testQuery,
    include: {
      questions: {
        include: {
          question: {
            include: {
              passage: {
                select: {
                  id: true,
                },
              },
            },
            select: {
              passageId: true,
            },
          },
        },
      },
    },
  });
  console.log(`Fetched ${allTests.length} tests`);

  // If no tests were fetched, log a warning and fetch all tests without any filter
  if (allTests.length === 0) {
    console.warn(
      "No tests fetched with the initial query. Fetching all available tests."
    );
    const allAvailableTests = await prisma.test.findMany({
      include: {
        questions: {
          include: {
            question: {
              select: {
                contentCategory: true,
              },
            },
          },
        },
      },
    });
    console.log(`Fetched ${allAvailableTests.length} tests without filter`);
    if (allAvailableTests.length === 0) {
      console.error("No tests available in the database.");
      return {
        tests: [],
        totalPages: 0,
        currentPage: page,
        conceptCategories: sortedConceptCategories,
      };
    }
    allTests.push(...allAvailableTests);
  }

  // Fetch user's test history
  const userTests = await prisma.userTest.findMany({
    where: { userId },
    select: { testId: true },
  });
  const takenTestIds = new Set(userTests.map((test) => test.testId));
  console.log(`User has taken ${takenTestIds.size} tests`);

  //Fetch user responses
  const userResponses = await prisma.userResponse.findMany({
    where: {
      userId,
    },
    orderBy: {
      answeredAt: "desc",
    },
    take: 25,
    select: {
      question: {
        select: {
          passageId: true,
        },
      },
    },
  });

  const recentlyTakenPassageIds = new Set(
    userResponses
      .map((response) => response.question.passageId)
      .filter((passageId) => passageId !== null) as string[]
  );

  //Filter tests that have already been taken and tests that have passages that have already been taken

  const filteredTests = allTests
    .filter((test) => !takenTestIds.has(test.id))
    .filter(
      (test) =>
        !test.questions.some((testQuestion) =>
          recentlyTakenPassageIds.has(testQuestion.question.passage?.id ?? "")
        )
    );

  // Calculate relevance score for each test
  const testsWithRelevance = filteredTests.map((test) => {
    const testContentCategories = [
      ...new Set(test.questions.map((q) => q.question.contentCategory)),
    ];

    const relevanceScore =
      testContentCategories.reduce((score, contentCategory) => {
        if (userContentCategories.has(contentCategory)) {
          const conceptCategory = sortedConceptCategories.find((cc) =>
            cc.contentCategories.includes(contentCategory!)
          );
          return score + (1 - (conceptCategory?.averageScore || 0)); // Higher score for lower mastery
        }
        return score;
      }, 0) / testContentCategories.length || 0; // Default to 0 if no categories match

    return {
      ...test,
      relevanceScore,
      taken: takenTestIds.has(test.id),
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
  const totalPages = Math.ceil(sortedTests.length / pageSize);

  console.log(
    `Returning ${paginatedTests.length} tests (page ${page} of ${totalPages})`
  );

  return {
    tests: paginatedTests.map(({ relevanceScore, taken, ...test }) => test),
    totalPages,
    currentPage: page,
    conceptCategories: sortedConceptCategories,
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
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const testId = searchParams.get("id");
    const isDiagnostic = searchParams.get("diagnostic") === "true";
    const CARSonly = searchParams.get("CARSonly") === "true";

    console.log("Request parameters:", {
      page,
      pageSize,
      testId,
      isDiagnostic,
      CARSonly,
    });

    if (isDiagnostic) {
      return new NextResponse(
        JSON.stringify({ testId: "clzikfkwt0000b3k9qtcfz7ko" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else if (testId) {
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
                  passageId: true,
                },
              },
            },
          },
        },
      });

      if (!test) {
        console.log(`Test not found for id: ${testId}`);
        return new NextResponse(JSON.stringify({ error: "Test not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.log(`Returning test with id: ${testId}`);
      return new NextResponse(JSON.stringify(test), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      console.log("Calling getOrderedTests");
      const testsData = await getOrderedTests(userId, page, pageSize, CARSonly);

      console.log("Tests data:", JSON.stringify(testsData, null, 2));
      return new NextResponse(JSON.stringify(testsData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("[TESTS_GET]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
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
      numberOfQuestions,
    } = body;

    if (!title || !description || !setName) {
      return new NextResponse(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
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
    const allCategories =
      categories.length > 0 ? categories : await prisma.category.findMany();

    // Determine number of questions to add
    const questionsToAdd = numberOfQuestions || allCategories.length;

    // Add questions to the test
    for (let i = 0; i < questionsToAdd; i++) {
      const category = allCategories[i % allCategories.length];
      const randomQuestion = await prisma.question.findFirst({
        where: { categoryId: category.id },
        orderBy: { id: "asc" }, // You might want to use a more sophisticated randomization method
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
                  },
                },
              },
            },
          },
        },
      },
    });

    return new NextResponse(JSON.stringify(createdTest), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[TESTS_POST]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
