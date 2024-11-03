import { auth } from "@clerk/nextjs/server";
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

    console.log('Received message:', message);
    console.log('Context:', context);
    console.log('Generate audio:', generateAudio);

    if (!userId) {
      console.log('Unauthorized: No userId');
      return NextResponse.json(
        { error: "Unauthorized - Please log in" }, 
        { status: 401 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API Key not configured');
      return NextResponse.json(
        { error: "Server configuration error" }, 
        { status: 503 }
      );
    }

    if (!message) {
      console.log('No message provided');
      return NextResponse.json(
        { error: "Message is required" }, 
        { status: 400 }
      );
    }

    try {
      // Use existing thread or create a new one
      let currentThreadId = threadId || userThreads.get(userId);
      if (!currentThreadId) {
        console.log('Creating new thread');
        const thread = await openai.beta.threads.create();
        currentThreadId = thread.id;
        userThreads.set(userId, currentThreadId);
      }

      console.log('Using thread:', currentThreadId);

      // Check for any active runs and cancel them if they exist
      try {
        const runs = await openai.beta.threads.runs.list(currentThreadId);
        const activeRun = runs.data.find(run => 
          ['in_progress', 'queued'].includes(run.status)
        );
        
        if (activeRun) {
          console.log('Cancelling active run:', activeRun.id);
          await openai.beta.threads.runs.cancel(currentThreadId, activeRun.id);
          // Wait a moment for the cancellation to take effect
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.log('Error checking/cancelling runs:', error);
        // Continue with the process even if checking/cancelling fails
      }

      // Combine message and context if context is provided
      const fullMessage = context 
        ? `Context: ${context}\n\nUser Message: ${message}` 
        : message;

      // Add the combined message to the thread
      await openai.beta.threads.messages.create(currentThreadId, {
        role: "user",
        content: fullMessage
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(currentThreadId, {
        assistant_id: assistantId,
      });

      // Wait for the run to complete with timeout
      let runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout

      while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error("Assistant response timeout");
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

    } catch (openAIError) {
      console.error('OpenAI API Error:', openAIError);
      return NextResponse.json({
        error: `OpenAI API Error: ${openAIError.message}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[CONVERSATION_ERROR]', error);
    return NextResponse.json({
      error: error instanceof Error 
        ? `Server Error: ${error.message}` 
        : "Internal Server Error"
    }, { status: 500 });
  }
}