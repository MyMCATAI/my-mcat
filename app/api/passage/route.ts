import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const passageId = searchParams.get("id");
    const decodedPassageId = passageId ? decodeURIComponent(passageId) : null;

    if (decodedPassageId) {
      // Fetch a single passage by ID with its questions
      const passage = await prisma.passage.findUnique({
        where: { id: decodedPassageId },
        include: {
          questions: {
            select: {
              id: true,
              questionID: true,
              questionContent: true,
              questionOptions: true,
              questionAnswerNotes: true,
              contentCategory: true,
            },
          },
        },
      });

      if (!passage) {
        return new NextResponse(
          JSON.stringify({ error: "Passage not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new NextResponse(JSON.stringify(passage), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Existing code for fetching multiple passages
      const skip = (page - 1) * pageSize;

      const passages = await prisma.passage.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          text: true,
          citation: true,
        },
      });

      const totalPassages = await prisma.passage.count();

      return new NextResponse(
        JSON.stringify({
          passages,
          totalPages: Math.ceil(totalPassages / pageSize),
          currentPage: page,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("[PASSAGES_GET]", error);
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
    console.log("Received body:", JSON.stringify(body, null, 2));

    const { title, citation, text, description, difficulty, questions } = body;

    // Create the passage
    const passage = await prisma.passage.create({
      data: {
        title,
        citation,
        text,
        description,
        difficulty: parseFloat(difficulty),
        questions: {
          create: questions.map((question: any) => ({
            questionContent: question.questionContent,
            questionOptions: JSON.stringify(question.questionOptions),
            questionAnswerNotes: question.questionAnswerNotes,
            context: question.context,
            difficulty: parseFloat(question.difficulty),
            contentCategory: question.contentCategory,
            categoryId: question.categoryId,
            questionID: question.questionID,
          })),
        },
      },
    });

    return new NextResponse(JSON.stringify(passage), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving passage:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to save passage",
        details:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Received body:", JSON.stringify(body, null, 2));

    const { id, title, citation, text, difficulty } = body;

    if (!id || !title || !citation || !text || difficulty === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedPassage = await prisma.passage.update({
      where: { id },
      data: {
        title,
        citation,
        text,
        difficulty: parseFloat(difficulty),
      },
    });

    console.log("Updated passage:", JSON.stringify(updatedPassage, null, 2));
    return NextResponse.json(updatedPassage);
  } catch (error) {
    console.error("Error updating passage:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs";
// import prisma from "@/lib/prismadb";

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const { userId } = auth();

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();
//     const { title, citation, text, description, difficulty } = body;

//     const updatedPassage = await prisma.passage.update({
//       where: { id: params.id },
//       data: {
//         title,
//         citation,
//         text,
//         description,
//         difficulty: parseFloat(difficulty),
//       },
//     });

//     return new NextResponse(JSON.stringify(updatedPassage), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error updating passage:", error);
//     return new NextResponse(
//       JSON.stringify({
//         error: "Failed to update passage",
//         details: error instanceof Error ? error.message : "An unknown error occurred",
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

// import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs";
// import prisma from "@/lib/prismadb";

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const { userId } = auth();

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();
//     const questions = body;

//     // Delete existing questions
//     await prisma.question.deleteMany({
//       where: { passageId: params.id },
//     });

//     // Create new questions
//     const createdQuestions = await prisma.question.createMany({
//       data: questions.map((q: any) => ({
//         ...q,
//         passageId: params.id,
//         questionOptions: JSON.stringify(q.questionOptions),
//       })),
//     });

//     return new NextResponse(JSON.stringify(createdQuestions), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error updating questions:", error);
//     return new NextResponse(
//       JSON.stringify({
//         error: "Failed to update questions",
//         details: error instanceof Error ? error.message : "An unknown error occurred",
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }
