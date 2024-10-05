// File: app/api/passage/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { allowedAdminUserIds } from "@/lib/utils";

// GET: Fetch passages or a single passage by ID
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const passageId = searchParams.get("id");

    const passage = await prisma.passage.findUnique({
      where: { id: decodeURIComponent(passageId || "") },
    });

    // Parse passage content if it's a string
    if (typeof passage?.text === "string") {
      try {
        passage.text = JSON.parse(passage.text ?? "");
      } catch (error) {
        console.error("Error parsing passage text:", error);
      }
    }

    if (passageId) {
      const passage = await prisma.passage.findUnique({
        where: { id: decodeURIComponent(passageId) },
        include: { questions: true }, // Include related questions
      });

      if (!passage) {
        return new NextResponse("Passage not found", { status: 404 });
      }
      return NextResponse.json(passage);
    } else {
      const passages = await prisma.passage.findMany();
      return NextResponse.json(passages);
    }
  } catch (error) {
    console.error("[PASSAGES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: Create a new passage
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId || !allowedAdminUserIds.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, citation, text, description, difficulty, questions } = body;

    // Validate required fields
    if (!title || !citation || !text || !difficulty || !questions) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

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
            questionOptions: JSON.stringify(question.questionOptions), // Ensure it's a JSON string
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

    return NextResponse.json(passage);
  } catch (error) {
    console.error("Error saving passage:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT: Update an existing passage
export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId || !allowedAdminUserIds.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new NextResponse("Missing passage ID", { status: 400 });
    }

    // Parse difficulty if it's provided
    if (updateData.difficulty) {
      updateData.difficulty = parseFloat(updateData.difficulty);
    }

    const updatedPassage = await prisma.passage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedPassage);
  } catch (error) {
    console.error("Error updating passage:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: Delete a passage by ID
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId || !allowedAdminUserIds.includes(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const passageId = searchParams.get("id");

    if (!passageId) {
      return new NextResponse("Missing passage ID", { status: 400 });
    }

    // Check if the passage exists before attempting to delete
    const passageExists = await prisma.passage.findUnique({
      where: { id: passageId },
    });

    if (!passageExists) {
      return new NextResponse("Passage not found", { status: 404 });
    }

    await prisma.passage.delete({
      where: { id: passageId },
    });

    return new NextResponse(null, { status: 204 }); // Correctly returning 204
  } catch (error) {
    console.error("Error deleting passage:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import prisma from "@/lib/prismadb";
// import { allowedAdminUserIds } from "@/lib/utils";

// export async function GET(req: Request) {
//   try {
//     console.log("GET request received");
//     const { userId } = auth();

//     if (!userId) {
//       console.log("Unauthorized: No userId found");
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get("page") || "1");
//     const pageSize = parseInt(searchParams.get("pageSize") || "10");
//     const passageId = searchParams.get("id");
//     const decodedPassageId = passageId ? decodeURIComponent(passageId) : null;

//     if (decodedPassageId) {
//       // Fetch a single passage by ID with its questions
//       const passage = await prisma.passage.findUnique({
//         where: { id: decodedPassageId },
//         include: {
//           questions: {
//             select: {
//               id: true,
//               questionID: true,
//               questionContent: true,
//               questionOptions: true,
//               questionAnswerNotes: true,
//               contentCategory: true,
//               // Added fields from the Question model
//               context: true,
//               categoryId: true,
//               difficulty: true,
//               passageId: true,
//             },
//           },
//         },
//       });

//       if (!passage) {
//         console.log("Passage not found, returning 404");
//         return new NextResponse(
//           JSON.stringify({ error: "Passage not found" }),
//           {
//             status: 404,
//             headers: { "Content-Type": "application/json" },
//           }
//         );
//       }

//       console.log("Returning single passage");
//       return new NextResponse(JSON.stringify(passage), {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       });
//     } else {
//       console.log("Fetching multiple passages");
//       // Existing code for fetching multiple passages
//       const skip = (page - 1) * pageSize;

//       const passages = await prisma.passage.findMany({
//         skip,
//         take: pageSize,
//         select: {
//           id: true,
//           text: true,
//           citation: true,
//         },
//       });

//       const totalPassages = await prisma.passage.count();

//       console.log(
//         `Fetched ${passages.length} passages. Total: ${totalPassages}`
//       );

//       return new NextResponse(
//         JSON.stringify({
//           passages,
//           totalPages: Math.ceil(totalPassages / pageSize),
//           currentPage: page,
//         }),
//         {
//           status: 200,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }
//   } catch (error) {
//     console.error("[PASSAGES_GET]", error);
//     return new NextResponse(
//       JSON.stringify({ error: "Internal Server Error" }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
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
//     console.log("Received body:", JSON.stringify(body, null, 2));

//     const { title, citation, text, description, difficulty, questions } = body;

//     // Create the passage
//     const passage = await prisma.passage.create({
//       data: {
//         title,
//         citation,
//         text,
//         description,
//         difficulty: parseFloat(difficulty),
//         questions: {
//           create: questions.map((question: any) => ({
//             questionContent: question.questionContent,
//             questionOptions: JSON.stringify(question.questionOptions),
//             questionAnswerNotes: question.questionAnswerNotes,
//             context: question.context,
//             difficulty: parseFloat(question.difficulty),
//             contentCategory: question.contentCategory,
//             categoryId: question.categoryId,
//             questionID: question.questionID,
//           })),
//         },
//       },
//     });

//     return new NextResponse(JSON.stringify(passage), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error saving passage:", error);
//     return new NextResponse(
//       JSON.stringify({
//         error: "Failed to save passage",
//         details:
//           error instanceof Error ? error.message : "An unknown error occurred",
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

// export async function PUT(req: NextRequest) {
//   try {
//     const { userId } = auth();
//     if (!userId || !allowedAdminUserIds.includes(userId)) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();
//     console.log("Received body:", JSON.stringify(body, null, 2));

//     const { id, ...updateData } = body;

//     if (!id) {
//       return NextResponse.json(
//         { error: "Missing passage ID" },
//         { status: 400 }
//       );
//     }

//     if (Object.keys(updateData).length === 0) {
//       return NextResponse.json(
//         { error: "No fields to update" },
//         { status: 400 }
//       );
//     }

//     // Parse difficulty if it's provided
//     if (updateData.difficulty) {
//       updateData.difficulty = parseFloat(updateData.difficulty);
//     }

//     const updatedPassage = await prisma.passage.update({
//       where: { id },
//       data: updateData,
//     });

//     console.log("Updated passage:", JSON.stringify(updatedPassage, null, 2));
//     return NextResponse.json(updatedPassage);
//   } catch (error) {
//     console.error("Error updating passage:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(req: Request) {
//   try {
//     const { userId } = auth();
//     if (!userId || !allowedAdminUserIds.includes(userId)) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const passageId = searchParams.get("id");

//     if (!passageId) {
//       return new NextResponse("Missing passage ID", { status: 400 });
//     }

//     // Check if the passage exists before attempting to delete
//     const passageExists = await prisma.passage.findUnique({
//       where: { id: passageId },
//     });

//     if (!passageExists) {
//       return new NextResponse("Passage not found", { status: 404 });
//     }

//     await prisma.passage.delete({
//       where: { id: passageId },
//     });

//     return new NextResponse(null, { status: 204 }); // Correctly returning 204
//   } catch (error) {
//     console.error("Error deleting passage:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import prisma from "@/lib/prismadb";
// import { allowedAdminUserIds } from "@/lib/utils";

// // GET: Fetch passages or a single passage by ID
// export async function GET(req: Request) {
//   try {
//     const { userId } = auth();
//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const passageId = searchParams.get("id");

//     if (passageId) {
//       const passage = await prisma.passage.findUnique({
//         where: { id: passageId },
//         include: { questions: true }, // Include related questions
//       });

//       if (!passage) {
//         return new NextResponse("Passage not found", { status: 404 });
//       }

//       return NextResponse.json(passage);
//     } else {
//       const passages = await prisma.passage.findMany();
//       return NextResponse.json(passages);
//     }
//   } catch (error) {
//     console.error("[PASSAGES_GET]", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }

// // POST: Create a new passage
// export async function POST(req: NextRequest) {
//   try {
//     const { userId } = auth();
//     if (!userId || !allowedAdminUserIds.includes(userId)) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();
//     const { title, citation, text, description, difficulty, questions } = body;

//     const passage = await prisma.passage.create({
//       data: {
//         title,
//         citation,
//         text,
//         description,
//         difficulty: parseFloat(difficulty),
//         questions: {
//           create: questions.map((question: any) => ({
//             questionContent: question.questionContent,
//             questionOptions: JSON.stringify(question.questionOptions),
//             questionAnswerNotes: question.questionAnswerNotes,
//             context: question.context,
//             difficulty: parseFloat(question.difficulty),
//             contentCategory: question.contentCategory,
//             categoryId: question.categoryId,
//             questionID: question.questionID,
//           })),
//         },
//       },
//     });

//     return NextResponse.json(passage);
//   } catch (error) {
//     console.error("Error saving passage:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }

// // PUT: Update an existing passage
// export async function PUT(req: NextRequest) {
//   try {
//     const { userId } = auth();
//     if (!userId || !allowedAdminUserIds.includes(userId)) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();
//     const { id, ...updateData } = body;

//     if (!id) {
//       return new NextResponse("Missing passage ID", { status: 400 });
//     }

//     const updatedPassage = await prisma.passage.update({
//       where: { id },
//       data: updateData,
//     });

//     return NextResponse.json(updatedPassage);
//   } catch (error) {
//     console.error("Error updating passage:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }

// // DELETE: Delete a passage by ID
// export async function DELETE(req: NextRequest) {
//   try {
//     const { userId } = auth();
//     if (!userId || !allowedAdminUserIds.includes(userId)) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const passageId = searchParams.get("id");

//     if (!passageId) {
//       return new NextResponse("Missing passage ID", { status: 400 });
//     }

//     await prisma.passage.delete({
//       where: { id: passageId },
//     });

//     return new NextResponse("Passage deleted successfully", { status: 204 });
//   } catch (error) {
//     console.error("Error deleting passage:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }
