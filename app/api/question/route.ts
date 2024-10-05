// // File: app/api/questions/route.ts

// import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import {
//   getQuestions,
//   createQuestion,
//   updateQuestion,
//   getQuestionById,
// } from "@/lib/question";
// import prisma from "@/lib/prismadb";
// import { allowedAdminUserIds } from "@/lib/utils";

// export async function GET(req: Request) {
//   try {
//     const { userId } = auth();

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const categoryId = searchParams.get("categoryId");
//     const passageId = searchParams.get("passageId");
//     const contentCategory = searchParams.get("contentCategory");
//     const conceptCategory =
//       searchParams.get("conceptCategory")?.replace(/_/g, " ") || "";
//     const page = parseInt(searchParams.get("page") || "1");
//     const pageSize = parseInt(searchParams.get("pageSize") || "10");

//     const result = await getQuestions({
//       categoryId: categoryId || undefined,
//       passageId: passageId || undefined,
//       contentCategory: contentCategory || undefined,
//       conceptCategory: conceptCategory || undefined,
//       page,
//       pageSize,
//     });

//     return NextResponse.json(result);
//   } catch (error) {
//     console.log("[QUESTIONS_GET]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const { userId } = auth();
//     console.log("Authenticated User ID:", userId);
//     console.log("Allowed Admin User IDs:", allowedAdminUserIds);

//     if (!userId || !allowedAdminUserIds.includes(userId)) {
//       console.log("Unauthorized: User is not an admin or not authenticated");
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();

//     // Validate required fields
//     if (
//       !body.questionID ||
//       !body.questionContent ||
//       !body.questionOptions ||
//       !body.contentCategory ||
//       !body.categoryId
//     ) {
//       return new NextResponse("Missing required fields", { status: 400 });
//     }

//     // Ensure questionOptions is an array of strings
//     if (
//       !Array.isArray(body.questionOptions) ||
//       body.questionOptions.length === 0
//     ) {
//       return new NextResponse(
//         "questionOptions must be a non-empty array of strings",
//         { status: 400 }
//       );
//     }

//     const newQuestion = await createQuestion({
//       questionID: body.questionID,
//       questionContent: body.questionContent,
//       questionOptions: JSON.stringify(body.questionOptions), // Ensure it's a JSON string
//       questionAnswerNotes: body.questionAnswerNotes,
//       contentCategory: body.contentCategory,
//       passageId: body.passageId,
//       categoryId: body.categoryId,
//     });

//     return NextResponse.json(newQuestion);
//   } catch (error) {
//     console.log("[QUESTIONS_POST]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }

// export async function PUT(req: Request) {
//   try {
//     const { userId } = auth();

//     if (!userId || !allowedAdminUserIds.includes(userId)) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();
//     console.log(body);
//     // Validate required fields
//     if (!body.id) {
//       return new NextResponse("Missing id", { status: 400 });
//     }

//     // Log body details
//     console.log("PUT request body:", {
//       id: body.id,
//       questionContent: body.questionContent,
//       questionOptions: body.questionOptions,
//       questionAnswerNotes: body.questionAnswerNotes,
//       contentCategory: body.contentCategory,
//       passageId: body.passageId,
//       categoryId: body.categoryId,
//       context: body.context,
//       difficulty: body.difficulty,
//     });

//     // Create an object with only the fields that are present in the request body
//     const updateData: Partial<{
//       questionContent: string;
//       questionOptions: string;
//       questionAnswerNotes: string;
//       contentCategory: string;
//       passageId: string;
//       categoryId: string;
//       context: string;
//       difficulty: number;
//     }> = {};

//     if (body.questionContent) updateData.questionContent = body.questionContent;
//     if (body.questionOptions) {
//       updateData.questionOptions = JSON.stringify(body.questionOptions); // Ensure it's a JSON string
//     }
//     if (body.questionAnswerNotes)
//       updateData.questionAnswerNotes = body.questionAnswerNotes;
//     if (body.contentCategory) updateData.contentCategory = body.contentCategory;
//     if (body.passageId) updateData.passageId = body.passageId;
//     if (body.categoryId) updateData.categoryId = body.categoryId;
//     if (body.context) updateData.context = body.context;
//     if (body.difficulty) updateData.difficulty = body.difficulty;

//     // Check if the question exists before updating
//     const existingQuestion = await prisma.question.findUnique({
//       where: { id: body.id },
//     });

//     if (!existingQuestion) {
//       return new NextResponse("Question not found", { status: 404 });
//     }

//     const updatedQuestion = await updateQuestion(body.id, updateData);

//     return NextResponse.json(updatedQuestion);
//   } catch (error) {
//     console.log("[QUESTIONS_PUT]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }

// // import { NextResponse } from "next/server";
// // import { auth } from "@clerk/nextjs/server";
// // import prisma from "@/lib/prismadb";
// // import { allowedAdminUserIds } from "@/lib/utils";

// // // GET: Fetch questions or a single question by ID
// // export async function GET(req: Request) {
// //   try {
// //     const { userId } = auth();
// //     if (!userId) {
// //       return new NextResponse("Unauthorized", { status: 401 });
// //     }

// //     const { searchParams } = new URL(req.url);
// //     const questionId = searchParams.get("id");

// //     if (questionId) {
// //       const question = await prisma.question.findUnique({
// //         where: { id: questionId },
// //       });

// //       if (!question) {
// //         return new NextResponse("Question not found", { status: 404 });
// //       }

// //       return NextResponse.json(question);
// //     } else {
// //       const questions = await prisma.question.findMany();
// //       return NextResponse.json(questions);
// //     }
// //   } catch (error) {
// //     console.error("[QUESTIONS_GET]", error);
// //     return new NextResponse("Internal Server Error", { status: 500 });
// //   }
// // }

// // // POST: Create a new question
// // export async function POST(req: Request) {
// //   try {
// //     const { userId } = auth();
// //     if (!userId || !allowedAdminUserIds.includes(userId)) {
// //       return new NextResponse("Unauthorized", { status: 401 });
// //     }

// //     const body = await req.json();
// //     const {
// //       questionContent,
// //       questionOptions,
// //       contentCategory,
// //       categoryId,
// //       questionID,
// //       difficulty,
// //     } = body;

// //     const newQuestion = await prisma.question.create({
// //       data: {
// //         questionContent,
// //         questionOptions: JSON.stringify(questionOptions),
// //         contentCategory,
// //         categoryId,
// //         questionID,
// //         difficulty: parseFloat(difficulty),
// //       },
// //     });

// //     return NextResponse.json(newQuestion);
// //   } catch (error) {
// //     console.error("[QUESTIONS_POST]", error);
// //     return new NextResponse("Internal Server Error", { status: 500 });
// //   }
// // }

// // // PUT: Update an existing question
// // export async function PUT(req: Request) {
// //   try {
// //     const { userId } = auth();
// //     if (!userId || !allowedAdminUserIds.includes(userId)) {
// //       return new NextResponse("Unauthorized", { status: 401 });
// //     }

// //     const body = await req.json();
// //     const { id, ...updateData } = body;

// //     if (!id) {
// //       return new NextResponse("Missing question ID", { status: 400 });
// //     }

// //     const updatedQuestion = await prisma.question.update({
// //       where: { id },
// //       data: updateData,
// //     });

// //     return NextResponse.json(updatedQuestion);
// //   } catch (error) {
// //     console.error("[QUESTIONS_PUT]", error);
// //     return new NextResponse("Internal Server Error", { status: 500 });
// //   }
// // }

// // // DELETE: Delete a question by ID
// // export async function DELETE(req: Request) {
// //   try {
// //     const { userId } = auth();
// //     if (!userId || !allowedAdminUserIds.includes(userId)) {
// //       return new NextResponse("Unauthorized", { status: 401 });
// //     }

// //     const { searchParams } = new URL(req.url);
// //     const questionId = searchParams.get("id");

// //     if (!questionId) {
// //       return new NextResponse("Missing question ID", { status: 400 });
// //     }

// //     await prisma.question.delete({
// //       where: { id: questionId },
// //     });

// //     return new NextResponse("Question deleted successfully", { status: 204 });
// //   } catch (error) {
// //     console.error("Error deleting question:", error);
// //     return new NextResponse("Internal Server Error", { status: 500 });
// //   }
// // }

// File: app/api/questions/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { allowedAdminUserIds } from "@/lib/utils";

// GET: Fetch questions or a single question by ID
export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("id");

    if (questionId) {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        return new NextResponse("Question not found", { status: 404 });
      }

      return NextResponse.json(question);
    } else {
      const questions = await prisma.question.findMany();
      return NextResponse.json(questions);
    }
  } catch (error) {
    console.error("[QUESTIONS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: Create a new question
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId || !allowedAdminUserIds.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (
      !body.questionID ||
      !body.questionContent ||
      !body.questionOptions ||
      !body.contentCategory ||
      !body.categoryId
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    // Ensure questionOptions is an array of strings
    let questionOptions: string[];
    if (typeof body.questionOptions === "string") {
      try {
        questionOptions = JSON.parse(body.questionOptions);
      } catch (error) {
        return new NextResponse("Invalid questionOptions format", {
          status: 400,
        });
      }
    } else if (Array.isArray(body.questionOptions)) {
      questionOptions = body.questionOptions;
    } else {
      return new NextResponse(
        "questionOptions must be an array or a valid JSON string",
        { status: 400 }
      );
    }

    const newQuestion = await prisma.question.create({
      data: {
        questionID: body.questionID,
        questionContent: body.questionContent,
        questionOptions: JSON.stringify(questionOptions), // Ensure it's a JSON string
        questionAnswerNotes: body.questionAnswerNotes,
        contentCategory: body.contentCategory,
        passageId: body.passageId,
        categoryId: body.categoryId,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("[QUESTIONS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT: Update an existing question
export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    if (!userId || !allowedAdminUserIds.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Log the incoming request body for debugging
    console.log("Incoming request body:", body);

    // Validate required fields
    if (!body.id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    if (
      !body.questionContent ||
      !body.questionOptions ||
      !body.contentCategory ||
      !body.categoryId
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if the question exists before updating
    const existingQuestion = await prisma.question.findUnique({
      where: { id: body.id },
    });

    if (!existingQuestion) {
      return new NextResponse("Question not found", { status: 404 });
    }

    // let questionOptions: string[];
    // if (typeof body.questionOptions === "string") {
    //   try {
    //     questionOptions = JSON.parse(body.questionOptions); // Convert string to array
    //   } catch (error) {
    //     return new NextResponse("Invalid questionOptions format", {
    //       status: 400,
    //     });
    //   }
    // } else if (Array.isArray(body.questionOptions)) {
    //   questionOptions = body.questionOptions; // Already an array
    // } else {
    //   return new NextResponse(
    //     "questionOptions must be an array or a valid JSON string",
    //     { status: 400 }
    //   );
    // }

    // Ensure questionContent is a valid string
    if (typeof body.questionContent !== "string") {
      return new NextResponse("questionContent must be a string", {
        status: 400,
      });
    }

    const updateData: Partial<{
      questionContent: string;
      questionOptions: string;
      questionAnswerNotes: string;
      contentCategory: string;
      passageId: string;
      categoryId: string;
      context: string;
      difficulty: number;
    }> = {};

    // Populate updateData with fields from the request body

    if (body.questionContent) {
      // Ensure questionContent is a valid string
      if (typeof body.questionContent === "string") {
        try {
          const parsedContent = JSON.parse(body.questionContent); // Parse if it's a string
          updateData.questionContent = JSON.stringify(parsedContent); // Stringify before saving
        } catch (error) {
          return new NextResponse("Invalid questionContent format", {
            status: 400,
          });
        }
      } else {
        updateData.questionContent = JSON.stringify(body.questionContent); // Stringify if it's an object
      }
    }
    if (body.questionOptions) {
      if (typeof body.questionOptions === "string") {
        try {
          updateData.questionOptions = JSON.parse(body.questionOptions); // Convert string to array
        } catch (error) {
          return new NextResponse("Invalid questionOptions format", {
            status: 400,
          });
        }
      } else if (Array.isArray(body.questionOptions)) {
        updateData.questionOptions = JSON.stringify(body.questionOptions); // Ensure it's a JSON string
      }
    }
    if (body.questionAnswerNotes) {
      updateData.questionAnswerNotes = body.questionAnswerNotes;
    }
    if (body.contentCategory) {
      updateData.contentCategory = body.contentCategory;
    }
    if (body.categoryId) {
      updateData.categoryId = body.categoryId;
    }
    if (body.context) {
      updateData.context = body.context;
    }
    if (body.difficulty) {
      updateData.difficulty = body.difficulty;
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: body.id },
      data: updateData,
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("[QUESTIONS_PUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
// DELETE: Delete a question by ID
export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    if (!userId || !allowedAdminUserIds.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("id");

    if (!questionId) {
      return new NextResponse("Missing question ID", { status: 400 });
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    return new NextResponse("Question deleted successfully", { status: 204 });
  } catch (error) {
    console.error("Error deleting question:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
