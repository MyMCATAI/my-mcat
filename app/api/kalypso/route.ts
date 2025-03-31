// pages/api/kalypso/route.ts
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const KALYPSOHOME_ID = process.env.KALYPSOHOME_ID || 'asst_P4vollVVGnpo2tIRQvkxRXXu';

console.log('[KALYPSO] KALYPSOHOME_ID:', KALYPSOHOME_ID); // Add this line

// Add this check after the KALYPSOHOME_ID declaration
if (!KALYPSOHOME_ID) {
  console.error('[KALYPSO] KALYPSOHOME_ID is not set in environment variables');
}

// Simple in-memory cache
const cache = new Map<string, { message: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per 60 seconds per IP
});

const validateData = (data: any) => {
  const requiredFields = {
    averageTestScore: 'number',
    averageTimePerQuestion: 'number',
    testsCompleted: 'number',
    totalTestsTaken: 'number',
    totalQuestionsAnswered: 'number',
    totalCoins: 'number',
  };

  for (const [field, type] of Object.entries(requiredFields)) {
    if (typeof data[field] !== type) {
      throw new Error(`Invalid data format for ${field}. Expected ${type}.`);
    }
  }
};

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  try {
    console.log(`[KALYPSO] Incoming request from IP: ${ip}`);

    await rateLimiter.consume(ip);
    console.log(`[KALYPSO] Rate limiter passed for IP: ${ip}`);

    const { userId } = auth();
    if (!userId) {
      console.warn('[KALYPSO] Unauthorized access attempt.');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log('[KALYPSO] Request body:', body);

    const { data } = body;

    // Validate data fields
    try {
      validateData(data);
    } catch (validationError: any) {
      console.warn(`[KALYPSO] ${validationError.message}`);
      return NextResponse.json({ error: validationError.message }, { status: 400 });
    }

    const cacheKey = `${userId}-${data.averageTestScore}-${data.averageTimePerQuestion}-${KALYPSOHOME_ID}`;

    // Check in-memory cache
    const cached = cache.get(cacheKey);
    const now = Date.now();
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`[KALYPSO] Cache hit for cache key: ${cacheKey}`);
      return NextResponse.json({ message: cached.message }, { status: 200 });
    }

    // Add this check before creating the thread
    if (!KALYPSOHOME_ID) {
      throw new Error('KALYPSOHOME_ID is not set');
    }

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add a message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `User Statistics:
- Average Test Score: ${data.averageTestScore}%
- Average Time Per Question: ${data.averageTimePerQuestion} seconds
- Tests Completed: ${data.testsCompleted}/${data.totalTestsTaken}
- Total Questions Answered: ${data.totalQuestionsAnswered}
- Total Coins: ${data.totalCoins}

Please provide a cute and encouraging message based on the above statistics.`
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: KALYPSOHOME_ID,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== "completed") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }
    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(message => message.role === "assistant");
    let message: string | undefined;

    if (assistantMessage?.content[0]?.type === 'text') {
      message = assistantMessage.content[0].text.value;
    }

    if (!message) {
      throw new Error("Empty response from OpenAI Assistant");
    }

    // Cache the response
    cache.set(cacheKey, { message, timestamp: now });

    console.log('[KALYPSO] OpenAI Assistant response:', message);

    return NextResponse.json({ message }, { status: 200 });

  } catch (error: any) {
    console.error('[KALYPSO_ERROR]', error.message || error);

    // Add more specific error handling
    if (error.message === 'KALYPSOHOME_ID is not set') {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (error instanceof Error && error.message.includes('Too Many Requests')) {
      console.warn('[KALYPSO] Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    console.error('[KALYPSO_ERROR]', error.message || error);

    const fallbackMessages = [
      "I'm whisker-ing you to try again soon! 🐱",
      "Purr-haps focus a bit more on your studies! 🐾",
      "I'm just kitten around, but you can do better! 🐱‍👓",
      "I'm tripping off some catnip right now. Ping me later? 🐈",
    ];

    const randomFallback = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    return NextResponse.json({ message: randomFallback }, { status: 500 });
  }
}
