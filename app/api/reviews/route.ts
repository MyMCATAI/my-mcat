import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = parseInt(searchParams.get("tier") || "1");
    const rating = parseInt(searchParams.get("rating") || "5");

    if (!prismadb) {
      console.error("Prisma client is undefined");
      return new NextResponse(
        JSON.stringify({ error: "Database client unavailable" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    
    try {
      console.log("Attempting to count reviews");
      const totalReviews = await prismadb.review.count({
        where: { tier, rating },
      });

      console.log(`Found ${totalReviews} total reviews for tier ${tier} and rating ${rating}`);

      if (totalReviews === 0) {
        return new NextResponse(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Generate a random skip value
      const randomSkip = Math.floor(Math.random() * totalReviews);

      // Fetch one random review
      const reviews = await prismadb.review.findMany({
        where: { tier, rating },
        take: 1,
        skip: randomSkip,
      });

      return new NextResponse(JSON.stringify(reviews), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      if (dbError instanceof Error) {
        return new NextResponse(
          JSON.stringify({ error: "Database Error", details: dbError.message, stack: dbError.stack }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        return new NextResponse(
          JSON.stringify({ error: "Database Error", details: "Unknown error occurred" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
  } catch (error) {
    console.error("[REVIEWS_GET]", error);
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({ error: "Internal Server Error", details: error.message, stack: error.stack }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Internal Server Error", details: "Unknown error occurred" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
      }
}
