// scripts/deleteAllPassages.ts
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables
dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

async function deleteAllPassages() {
  try {
    // First, delete all questions associated with passages
    const deleteQuestionsResult = await prisma.question.deleteMany({
      where: {
        passageId: { not: null },
      },
    });
    console.log(
      `Deleted ${deleteQuestionsResult.count} questions associated with passages.`
    );

    // Then, delete all passages
    const deletePassagesResult = await prisma.passage.deleteMany();
    console.log(`Deleted ${deletePassagesResult.count} passages.`);

    console.log(
      "All passages and their associated questions have been deleted."
    );
  } catch (error) {
    console.error("Error deleting passages:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllPassages().catch(console.error);
