import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ElevenLabsClient } from "elevenlabs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
});

const assistantId: string = process.env.ASSISTANT_ID || "";
if (!assistantId) {
  throw new Error("Assistant ID not configured in .env file");
}

// In-memory store for thread IDs (replace with a database in production)
const userThreads = new Map<string, string>();

// Move function declarations outside of the main function
function extractTextFromMessage(message: any): string {
  if (Array.isArray(message.content)) {
    return message.content
      .filter((content: any) => content.type === 'text')
      .map((content: any) => content.text.value)
      .join('\n');
  } else if (typeof message.content === 'string') {
    return message.content;
  }
  return '';
}

async function createAudioStreamFromText(text: string): Promise<Buffer> {
  const audioStream = await elevenlabs.generate({
    voice: "Kalypso",
    model_id: "eleven_multilingual_v2",
    text,
  });

  const chunks: Uint8Array[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { message, context, threadId, generateAudio } = body;

    console.log('Received message:');
    console.log('Generate audio:', generateAudio);
    if (!userId) {
      console.log('Unauthorized: No userId');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API Key not configured');
      return NextResponse.json({ error: "OpenAI API Key not configured." }, { status: 503 });
    }

    if (!message) {
      console.log('No message provided');
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Use existing thread or create a new one
    let currentThreadId = threadId || userThreads.get(userId);
    if (!currentThreadId) {
      console.log('Creating new thread');
      const thread = await openai.beta.threads.create();
      currentThreadId = thread.id;
      userThreads.set(userId, currentThreadId);
    }

    console.log('Using thread:', currentThreadId);

    // Combine message and context if context is provided
    const fullMessage = context ? `Context: ${context}\n\nUser Message: ${message}` : message;

    // Add the combined message to the thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: fullMessage
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(currentThreadId, {
      assistant_id: assistantId,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
    }

    // Retrieve only the last message from the assistant
    const messages = await openai.beta.threads.messages.list(currentThreadId, { limit: 1 });
    const lastMessage = messages.data[0];

    if (!lastMessage || lastMessage.role !== 'assistant') {
      throw new Error("No response from assistant");
    }

    console.log('Received response from Assistant');

    const textToConvert = extractTextFromMessage(lastMessage);
  
    let audioBase64 = null;
    if (generateAudio) {
      const audioBuffer = await createAudioStreamFromText(textToConvert);
      audioBase64 = audioBuffer.toString('base64');
    }

    return NextResponse.json({
      message: textToConvert,
      audio: audioBase64,
      threadId: currentThreadId
    }, { status: 200 });

  } catch (error) {
    console.error('[CONVERSATION_ERROR]', error);
    return NextResponse.json({
      error: error instanceof Error ? `Internal Error: ${error.message}` : "Internal Error"
    }, {
      status: error instanceof Error ? 500 : 500
    });
  }
}