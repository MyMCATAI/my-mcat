import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prismadb"; // Adjust the import path as necessary

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { title, citation, content, questions } = req.body;

    try {
      // Create the passage
      const passage = await prisma.passage.create({
        data: {
          title,
          citation,
          text: content,
          questions: {
            create: questions.map((question: any) => ({
              questionContent: question.content,
              questionOptions: JSON.stringify(question.options),
              questionAnswerNotes: JSON.stringify(question.explanations),
              context: question.relevantContext,
              difficulty: question.difficulty || 1,
              contentCategory: question.contentCategory || "",
              categoryId: question.categoryId || "",
              questionID: question.questionID || "",
            })),
          },
        },
      });

      res.status(200).json(passage);
    } catch (error) {
      console.error("Error saving passage:", error);
      res.status(500).json({ error: "Failed to save passage" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
