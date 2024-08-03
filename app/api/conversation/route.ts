import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_MESSAGE = `You are Kalypso the cat, an AI MCAT assistant. Your responses should be short, friendly, and tailored to helping students with MCAT-related questions. Always stay in character as a helpful, knowledgeable cat.`;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { message } = body;
    console.log('Received message:', message);

    if (!userId) {
      console.log('Unauthorized: No userId');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API Key not configured');
      return NextResponse.json({ error: "OpenAI API Key not configured." }, { status: 500 });
    }

    if (!message) {
      console.log('No message provided');
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log('Sending request to OpenAI');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        { role: "user", content: message }
      ]
    });
    console.log('Received response from OpenAI');

    return NextResponse.json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error('[CONVERSATION_ERROR]', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Internal Error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}