// api/test/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { Test } from "@/types";
import { startOfDay, endOfDay } from "date-fns";

type ConceptCategory = {
  name: string;
  averageScore: number;
  contentCategories: string[];
};

async function getRecentTestScores(userId: string) {
  const recentTests = await prisma.userTest.findMany({
    where: {
      userId,
      score: { not: null },
      finishedAt: { not: null },
    },
    orderBy: { finishedAt: "desc" },
    take: 3,
    select: { score: true },
  });

  const scores = recentTests.map((test) => test.score as number);
  return scores;
}

async function getOrderedTests(
  userId: string,
  page: number,
  pageSize: number,
  CARSonly: boolean = false
) {
  const skip = (page - 1) * pageSize;

  // Fetch user's knowledge profiles
  const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
    where: {
      userId,
      ...(CARSonly && { category: { subjectCategory: "CARs" } }),
    },
    include: { category: true },
  });
  
  // Calculate average scores for each concept category and collect content categories
  const conceptCategories: {
    [key: string]: ConceptCategory & { count: number };
  } = {};
  const userContentCategories = new Set<string>();
  knowledgeProfiles.forEach(
    (profile: {
      category: { conceptCategory: any; contentCategory: any };
      conceptMastery: number | null;
    }) => {
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
        conceptCategories[conceptCategory].averageScore +=
          profile.conceptMastery;
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
    }
  );

  // Calculate final average scores and sort categories
  const sortedConceptCategories = Object.values(conceptCategories)
    .map((category) => ({
      name: category.name,
      averageScore:
        category.count > 0 ? category.averageScore / category.count : 0,
      contentCategories: category.contentCategories,
    }))
    .sort((a, b) => a.averageScore - b.averageScore);

  // console.log("Sorted concept categories:", sortedConceptCategories);
  // console.log("User content categories:", Array.from(userContentCategories));

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

  // console.log("Test query:", JSON.stringify(testQuery, null, 2));

  const allTests = await prisma.test.findMany({
    where: testQuery,
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
  const [userTests, userResponses] = await Promise.all([
    prisma.userTest.findMany({
      where: { userId },
      select: { testId: true, passageId: true, finishedAt: true },
    }),
    //Fetch user responses
    prisma.userResponse.findMany({
      where: { userId },
      select: { question: { select: { passageId: true } } },
      orderBy: { answeredAt: "desc" },
      take: 25,
    }),
  ]);
  const takenTestIds = new Set(
    userTests
      .filter((test: any) => test.finishedAt !== null)
      .map((test: any) => test.testId)
  );
  
  const recentlyTakenPassageIds = new Set(
    userTests.map((test: any) => test.passageId)
  );

  // Filter tests that have not been taken yet
  const filteredTests = allTests.filter(
    (test: { id: unknown }) => !takenTestIds.has(test.id)
  );
  
  // Further filter tests that have passages that have already been taken
  const finalFilteredTests = filteredTests.filter(
    (test: { questions: any[] }) =>
      !test.questions.some((testQuestion: { questionId: any }) =>
        prisma.question
          .findUnique({
            where: { id: testQuestion.questionId },
            select: { passage: { select: { id: true } } },
          })
          .then((question: { passage: { id: string } | null } | null) =>
            recentlyTakenPassageIds.has(question?.passage?.id ?? "")
          )
      )
  );

  // Function to get the next test of the same passage
  async function getNextTestOfSamePassage(userId: string) {
    const passageTests: { [x: string]: any[] } = allTests.reduce(
      (
        acc: { [x: string]: any[] },
        test: { passageId: string | number | null; id: any }
      ) => {
        if (test.passageId !== null) {
          // Check for null before using as index
          if (!acc[test.passageId]) {
            acc[test.passageId] = [];
          }
          acc[test.passageId].push(test.id);
        }
        return acc;
      },
      {} as { [key: string]: any[] }
    );

    for (const test of userTests) {
      if (test.passageId !== null) {
        // Check for null before using as index
        const passageId = test.passageId;
        const testId = test.testId;
        if (passageTests[passageId] && passageTests[passageId].length > 1) {
          const nextTestId = passageTests[passageId].find(
            (id) => id !== testId
          );
          if (nextTestId && !takenTestIds.has(nextTestId)) {
            return nextTestId;
          }
        }
      }
    }

    return null;
  }

  // Calculate relevance score for each test
  interface TestWithRelevance {
    id: unknown;
    questions: any[];
    difficulty?: number;
    relevanceScore: number;
    taken: boolean;
    title?: string;
    passageId?: string | null;
  }

  const testsWithRelevance = filteredTests.map(
    (test: {
      id: string;
      title: string;
      description: string | null;
      questions: Array<{
        question: {
          contentCategory: string;
        };
      }>;
      difficulty: number | null;
      passageId: string | null;
    }) => {
      const testContentCategories = [
        ...new Set(
          test.questions.map(
            (q: { question: { contentCategory: any } }) =>
              q.question.contentCategory
          )
        ),
      ];

      const relevanceScore =
        testContentCategories.reduce((score, contentCategory) => {
          if (userContentCategories.has(contentCategory)) {
            const conceptCategory = sortedConceptCategories.find(
              (cc: { contentCategories: string | any[] }) =>
                cc.contentCategories.includes(contentCategory)
            );
            return score + (1 - (conceptCategory?.averageScore || 0));
          }
          return score;
        }, 0) / testContentCategories.length || 0;

      return {
        ...test,
        relevanceScore,
        taken: takenTestIds.has(test.id),
      } as TestWithRelevance;
    }
  );

  // Add this before the testsWithRelevance mapping
  const recentScores = await getRecentTestScores(userId);

  function getRecommendedDifficulty(scores: number[]) {
    
    // If no scores yet, start with level 1
    if (scores.length === 0) {
      return 1;
    }
    
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (averageScore < 65) {
      return 1;        // Level 1 for < 65%
    }
    if (averageScore < 90) {
      return 2;        // Level 2 for 65-90%
    }
    return 3;         // Level 3 for > 90%
  }

  // Add this function near the top with other helper functions
  async function findPart2Test(title: string) {
    // Remove " - Part 1" from the title and prepare the part 2 title
    const baseTitlePart1 = title.replace(/\s*-\s*Part\s*1\s*$/i, '').trim();
    const titlePart2 = `${baseTitlePart1} - Part 2`;

    // Search in ALL tests, regardless of difficulty
    const part2Test = await prisma.test.findFirst({
      where: {
        title: titlePart2
      },
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

    return part2Test;
  }

  const sortedTests = await Promise.all(testsWithRelevance.map(async (test) => {
    // Check if this test has a corresponding Part 2
    if (test.title?.includes('Part 1')) {
      const part2Test = await findPart2Test(test.title);
      if (part2Test && !testsWithRelevance.some(t => t.title === part2Test.title)) {
        // Add the Part 2 test to our list if it exists
        testsWithRelevance.push({
          ...part2Test,
          relevanceScore: test.relevanceScore,
          taken: false
        } as TestWithRelevance);
      }
    } 
    return test;
  }));

  // Now sort with the updated list
  const finalSortedTests = sortedTests.sort((a: TestWithRelevance, b: TestWithRelevance) => {
    // First, check if either test is a "Part 2" of a recently completed test
    const isAPart2 = a.title?.includes('Part 2');
    const isBPart2 = b.title?.includes('Part 2');
    const aBaseTitle = a.title?.replace(/\s*-\s*Part\s*[12]\s*$/i, '').trim();
    const bBaseTitle = b.title?.replace(/\s*-\s*Part\s*[12]\s*$/i, '').trim();

    // If tests are part of the same series (Part 1 and 2)
    if (aBaseTitle === bBaseTitle) {
      // Keep Part 1 before Part 2
      if (isAPart2 && !isBPart2) return 1;
      if (!isAPart2 && isBPart2) return -1;
    }

    // Rest of the sorting logic remains the same...
    const recommendedDifficulty = getRecommendedDifficulty(recentScores);
    
    // If neither test has been taken
    if (!a.taken && !b.taken) {
      
      // First, compare by how close they are to the recommended difficulty
      const aDiffDist = Math.abs((a.difficulty || 1) - recommendedDifficulty);
      const bDiffDist = Math.abs((b.difficulty || 1) - recommendedDifficulty);
      
      if (aDiffDist !== bDiffDist) {
        const result = aDiffDist - bDiffDist;
        return result;
      }
      
      // If they're equally close to recommended difficulty, use relevance score
      const result = b.relevanceScore - a.relevanceScore;
      return result;
    }
    
    // Keep existing logic for taken tests
    if (!a.taken) return -1;
    if (!b.taken) return 1;
    return b.relevanceScore - a.relevanceScore;
  });

  // Apply pagination
  let paginatedTests = finalSortedTests.slice(skip, skip + pageSize);
  const totalPages = Math.ceil(finalSortedTests.length / pageSize);
  
  const introTestCompleted = await hasCompletedIntroTest(userId);

  if (!introTestCompleted) {
    // Get the intro test
    const introTest = await prisma.test.findUnique({
      where: { id: "cm4nr1new004p5v6dxty82tws" },
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

    if (introTest) {
      // Remove intro test if it's in the current page
      const filteredPageTests = paginatedTests.filter(test => test.id !== introTest.id);
      // Add intro test at the beginning with required TestWithRelevance properties
      paginatedTests = [{
        ...introTest,
        relevanceScore: 1, // Give it maximum relevance
        taken: false
      } as TestWithRelevance, ...filteredPageTests.slice(0, pageSize - 1)];
    }
  }

  return {
    tests: paginatedTests.map(({ relevanceScore, taken, ...test }) => test as Test),
    totalPages,
    currentPage: page,
    conceptCategories: sortedConceptCategories,
  };
}

// Add this helper function at the top
async function hasCompletedIntroTest(userId: string) {
  const completedIntroTest = await prisma.userTest.findFirst({
    where: {
      userId: userId,
      testId: "cm4nr1new004p5v6dxty82tws",
      finishedAt: { not: null }, // Make sure it's completed
    },
  });

  return !!completedIntroTest;
}

export async function GET(req: Request) {

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

    // Get the number of tests completed today
    const today = new Date();

    // First, let's check all tests for this user today without restrictions
    const allUserTestsToday = await prisma.userTest.findMany({
      where: {
        userId: userId,
        finishedAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    
    // Then do our actual count
    const testsCompletedToday = await prisma.userTest.count({
      where: {
        userId: userId,
        finishedAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
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
                  context: true,
                },
              },
            },
          },
        },
      });

      if (!test) {
        return new NextResponse(JSON.stringify({ error: "Test not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new NextResponse(JSON.stringify(test), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const testsData = await getOrderedTests(userId, page, pageSize, CARSonly);
      
      return new NextResponse(
        JSON.stringify({ ...testsData, testsCompletedToday }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
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
