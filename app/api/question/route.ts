// File: app/api/questions/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getQuestions, createQuestion } from "@/lib/question";
import { PrismaPromise } from "@prisma/client/runtime/library";
import prisma from "@/lib/prismadb"; // Make sure this import is correct

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const passageId = searchParams.get("passageId");
    const contentCategory = searchParams.get("contentCategory");
    const conceptCategory =
      searchParams.get("conceptCategory")?.replace(/_/g, " ") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const result = await getQuestions({
      categoryId: categoryId || undefined,
      passageId: passageId || undefined,
      contentCategory: contentCategory || undefined,
      conceptCategory: conceptCategory || undefined,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log("[QUESTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
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
    if (
      !Array.isArray(body.questionOptions) ||
      body.questionOptions.length === 0
    ) {
      return new NextResponse(
        "questionOptions must be a non-empty array of strings",
        { status: 400 }
      );
    }

    const newQuestion = await createQuestion({
      questionID: body.questionID,
      questionContent: body.questionContent,
      questionOptions: body.questionOptions,
      questionAnswerNotes: body.questionAnswerNotes,
      contentCategory: body.contentCategory,
      passageId: body.passageId,
      categoryId: body.categoryId,
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.log("[QUESTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function PUT(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("Received body:", JSON.stringify(body, null, 2));

    const { passageId, questions } = body;

    if (!passageId || !questions || !Array.isArray(questions)) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    console.log("PassageId:", passageId);
    console.log("Questions:", JSON.stringify(questions, null, 2));

    // Perform the update in a transaction
    const updatedQuestions = await prisma.$transaction(async (tx) => {
      console.log("Starting transaction");

      // Delete questions that are no longer present
      const existingQuestionIds = questions.map((q) => q.id).filter((id) => id);
      console.log("Existing question IDs:", existingQuestionIds);

      const deletedQuestions = await tx.question.deleteMany({
        where: {
          passageId: passageId,
          id: { notIn: existingQuestionIds },
        },
      });
      console.log("Deleted questions:", deletedQuestions);

      // Update or create questions
      const upsertPromises = questions.map(async (q) => {
        console.log("Processing question:", JSON.stringify(q, null, 2));

        let processedOptions;
        try {
          processedOptions = Array.isArray(q.questionOptions)
            ? q.questionOptions
            : typeof q.questionOptions === "string"
            ? JSON.parse(q.questionOptions)
            : [];
        } catch (error) {
          console.error("Error parsing questionOptions:", error);
          processedOptions = [];
        }

        return tx.question.upsert({
          where: { id: q.id || "new-id" },
          update: {
            questionContent: q.questionContent,
            questionOptions: processedOptions,
            questionAnswerNotes: q.questionAnswerNotes,
            contentCategory: q.contentCategory,
            categoryId: q.categoryId,
            context: q.context,
            difficulty: parseFloat(q.difficulty),
            questionID: q.questionID,
            passageId: passageId,
          },
          create: {
            passageId: passageId,
            questionContent: q.questionContent,
            questionOptions: processedOptions,
            questionAnswerNotes: q.questionAnswerNotes,
            contentCategory: q.contentCategory,
            categoryId: q.categoryId,
            context: q.context,
            difficulty: parseFloat(q.difficulty),
            questionID: q.questionID,
          },
        });
      });

      console.log("Executing upsert operations");
      return Promise.all(upsertPromises);
    });

    console.log(
      "Transaction completed. Updated questions:",
      JSON.stringify(updatedQuestions, null, 2)
    );

    return new NextResponse(JSON.stringify(updatedQuestions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[QUESTIONS_PUT] Detailed error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// export async function PUT(req: Request) {
//   try {
//     const { userId } = auth();

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();
//     console.log("Received body:", JSON.stringify(body, null, 2));

//     const { passageId, questions } = body;

//     if (!passageId || !questions || !Array.isArray(questions)) {
//       return new NextResponse("Invalid request body", { status: 400 });
//     }

//     console.log("PassageId:", passageId);
//     console.log("Questions:", JSON.stringify(questions, null, 2));

//     // Perform the update in a transaction
//     const updatedQuestions = await prisma.$transaction(async (tx) => {
//       console.log("Starting transaction");

//       // Delete questions that are no longer present
//       const existingQuestionIds = questions.map((q) => q.id).filter((id) => id);
//       console.log("Existing question IDs:", existingQuestionIds);

//       const deletedQuestions = await tx.question.deleteMany({
//         where: {
//           passageId: passageId,
//           id: { notIn: existingQuestionIds },
//         },
//       });
//       console.log("Deleted questions:", deletedQuestions);

//       // Update or create questions
//       const upsertPromises = questions.map(async (q) => {
//         console.log("Processing question:", JSON.stringify(q, null, 2));

//         let processedOptions;
//         try {
//           processedOptions = Array.isArray(q.questionOptions)
//             ? q.questionOptions
//             : typeof q.questionOptions === "string"
//             ? JSON.parse(q.questionOptions)
//             : [];
//         } catch (error) {
//           console.error("Error parsing questionOptions:", error);
//           processedOptions = [];
//         }

//         return tx.question.upsert({
//           where: { id: q.id || "new-id" },
//           update: {
//             questionContent: q.questionContent,
//             questionOptions: processedOptions,
//             questionAnswerNotes: q.questionAnswerNotes,
//             contentCategory: q.contentCategory,
//             categoryId: q.categoryId,
//             context: q.context,
//             difficulty: parseFloat(q.difficulty),
//             questionID: q.questionID,
//             passageId: passageId,
//           },
//           create: {
//             passageId: passageId,
//             questionContent: q.questionContent,
//             questionOptions: processedOptions,
//             questionAnswerNotes: q.questionAnswerNotes,
//             contentCategory: q.contentCategory,
//             categoryId: q.categoryId,
//             context: q.context,
//             difficulty: parseFloat(q.difficulty),
//             questionID: q.questionID,
//           },
//         });
//       });

//       console.log("Executing upsert operations");
//       return Promise.all(upsertPromises);
//     });

//     console.log(
//       "Transaction completed. Updated questions:",
//       JSON.stringify(updatedQuestions, null, 2)
//     );

//     return new NextResponse(JSON.stringify(updatedQuestions), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("[QUESTIONS_PUT] Detailed error:", error);
//     return new NextResponse(
//       JSON.stringify({
//         error: "Internal Server Error",
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

// export async function PUT(req: Request) {
//   try {
//     const { userId } = auth();

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();
//     console.log("Received body:", body); // Log the received body

//     const { passageId, questions } = body;

//     if (!passageId || !questions || !Array.isArray(questions)) {
//       return new NextResponse("Invalid request body", { status: 400 });
//     }

//     console.log("PassageId:", passageId);
//     console.log("Questions:", questions);

//     // Perform the update in a transaction
//     const updatedQuestions = await prisma.$transaction(async (tx) => {
//       console.log("Starting transaction");

//       // Delete questions that are no longer present
//       const existingQuestionIds = questions.map((q) => q.id).filter((id) => id);
//       console.log("Existing question IDs:", existingQuestionIds);

//       const deletedQuestions = await tx.question.deleteMany({
//         where: {
//           passageId: passageId,
//           id: { notIn: existingQuestionIds },
//         },
//       });
//       console.log("Deleted questions:", deletedQuestions);

//       // Update or create questions
//       const upsertPromises = questions.map(async (q) => {
//         console.log("Processing question:", q);

//         let processedOptions;
//         try {
//           processedOptions = Array.isArray(q.questionOptions)
//             ? q.questionOptions
//             : JSON.parse(q.questionOptions);
//         } catch (error) {
//           console.error("Error parsing questionOptions:", error);
//           processedOptions = [];
//         }

//         return tx.question.upsert({
//           where: { id: q.id || "new-id" },
//           update: {
//             questionContent: q.questionContent,
//             questionOptions: processedOptions,
//             questionAnswerNotes: q.questionAnswerNotes,
//             contentCategory: q.contentCategory,
//             categoryId: q.categoryId,
//             context: q.context,
//             difficulty: q.difficulty,
//             questionID: q.questionID,
//           },
//           create: {
//             passageId: passageId,
//             questionContent: q.questionContent,
//             questionOptions: processedOptions,
//             questionAnswerNotes: q.questionAnswerNotes,
//             contentCategory: q.contentCategory,
//             categoryId: q.categoryId,
//             context: q.context,
//             difficulty: q.difficulty,
//             questionID: q.questionID,
//           },
//         });
//       });

//       console.log("Executing upsert operations");
//       return Promise.all(upsertPromises);
//     });

//     console.log("Transaction completed. Updated questions:", updatedQuestions);

//     return new NextResponse(JSON.stringify(updatedQuestions), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("[QUESTIONS_PUT] Detailed error:", error);
//     return new NextResponse(
//       JSON.stringify({
//         error: "Internal Server Error",
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

// export async function PUT(req: Request) {
//   try {
//     const { userId } = auth();

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();
//     const { passageId, questions } = body;

//     if (!passageId || !questions || !Array.isArray(questions)) {
//       return new NextResponse("Invalid request body", { status: 400 });
//     }

//     // Perform the update in a transaction
//     const updatedQuestions = await prisma.$transaction(async (tx) => {
//       // Delete questions that are no longer present
//       const existingQuestionIds = questions.map((q) => q.id).filter((id) => id);
//       await tx.question.deleteMany({
//         where: {
//           passageId: passageId,
//           id: { notIn: existingQuestionIds },
//         },
//       });

//       // Update or create questions
//       const upsertPromises = questions.map((q) =>
//         tx.question.upsert({
//           where: { id: q.id || "new-id" },
//           update: {
//             questionContent: q.questionContent,
//             questionOptions: Array.isArray(q.questionOptions)
//               ? q.questionOptions
//               : JSON.parse(q.questionOptions),
//             questionAnswerNotes: q.questionAnswerNotes,
//             contentCategory: q.contentCategory,
//             categoryId: q.categoryId,
//             context: q.context,
//             difficulty: q.difficulty,
//             questionID: q.questionID,
//           },
//           create: {
//             passageId: passageId,
//             questionContent: q.questionContent,
//             questionOptions: Array.isArray(q.questionOptions)
//               ? q.questionOptions
//               : JSON.parse(q.questionOptions),
//             questionAnswerNotes: q.questionAnswerNotes,
//             contentCategory: q.contentCategory,
//             categoryId: q.categoryId,
//             context: q.context,
//             difficulty: q.difficulty,
//             questionID: q.questionID,
//           },
//         })
//       );

//       return Promise.all(upsertPromises);
//     });

//     return new NextResponse(JSON.stringify(updatedQuestions), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("[QUESTIONS_PUT]", error);
//     return new NextResponse(
//       JSON.stringify({
//         error: "Internal Server Error",
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

// export async function PUT(req: Request) {
//   try {
//     const { userId } = auth();

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();
//     const { passageId, questions } = body;

//     if (!passageId || !questions || !Array.isArray(questions)) {
//       return new NextResponse("Invalid request body", { status: 400 });
//     }

//     // Update existing questions and add new ones
//     const upsertPromises = questions.map((q: any) =>
//       prisma?.question.upsert({
//         where: {
//           id: q.id || "new-id", // Use a placeholder ID for new questions
//         },
//         update: {
//           questionContent: q.questionContent,
//           questionOptions: JSON.stringify(q.questionOptions),
//           questionAnswerNotes: q.questionAnswerNotes,
//           contentCategory: q.contentCategory,
//           categoryId: q.categoryId,
//           context: q.context,
//           difficulty: q.difficulty,
//           questionID: q.questionID,
//         },
//         create: {
//           passageId: passageId,
//           questionContent: q.questionContent,
//           questionOptions: JSON.stringify(q.questionOptions),
//           questionAnswerNotes: q.questionAnswerNotes,
//           contentCategory: q.contentCategory,
//           categoryId: q.categoryId,
//           context: q.context,
//           difficulty: q.difficulty,
//           questionID: q.questionID,
//         },
//       })
//     );
//     // Filter out any undefined values
//     // const validUpsertPromises = upsertPromises.filter(
//     //   (promise): promise is PrismaPromise<any> => promise !== undefined
//     // );

//     // // Use the filtered array in the transaction
//     // await prisma?.$transaction(validUpsertPromises);

//     // Fetch the updated questions to return
//     const updatedQuestions = await prisma?.question.findMany({
//       where: { passageId: passageId },
//     });

//     return new NextResponse(JSON.stringify(updatedQuestions), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("[QUESTIONS_PUT]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }
