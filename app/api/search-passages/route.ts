import { NextResponse } from "next/server";
import { getPassagesByQuery } from "@/lib/passage";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const passages = await getPassagesByQuery(query);
    return NextResponse.json(passages);
  } catch (error) {
    console.error("Error searching passages:", error);
    return NextResponse.json(
      { error: "An error occurred while searching for passages" },
      { status: 500 }
    );
  }
}
