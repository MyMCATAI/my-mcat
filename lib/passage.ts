import { Passage } from "@/types";
import prismadb from "./prismadb";

export async function getPassagesByQuery(query: string): Promise<Passage[]> {
  try {
    const passages = await prismadb.passage.findMany({
      where: {
        OR: [
          { text: { contains: query } },
          { title: { contains: query } },
          { description: { contains: query } },
          { citation: { contains: query } },
        ],
      },
      include: {
        questions: true,
      },
    });
    return passages.map((passage) => ({
      ...passage,
      title: passage.title || "Untitled Passage", // Provide a default title if null
    }));
  } catch (error) {
    console.error("Error fetching passages:", error);
    throw error;
  }
}
