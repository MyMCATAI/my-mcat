import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
console.log(" Tried to run Job Ran at: ", new Date());

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  console.log("Cron Job Ran at: ", new Date());

  return NextResponse.json({ message: "Cron Job Ran at " + new Date() });
}