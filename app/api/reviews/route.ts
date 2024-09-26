import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = parseInt(searchParams.get("tier") || "1");
    const count = parseInt(searchParams.get("count") || "3");

    if (isNaN(tier) || tier < 1 || tier > 3) {
      return new NextResponse(JSON.stringify({ error: "Invalid tier" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const reviews = await prisma.review.findMany({
      where: { tier },
      orderBy: { id: 'asc' },
      take: count,
    });

    // Shuffle the reviews
    for (let i = reviews.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [reviews[i], reviews[j]] = [reviews[j], reviews[i]];
    }

    return new NextResponse(JSON.stringify(reviews), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[REVIEWS_GET]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
