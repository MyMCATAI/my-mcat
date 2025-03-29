import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_SYSTEM_PROMPT = "You are Kalypso, a friendly AI cat tutor. Be encouraging but direct, keep responses under 100 words.";

export async function generateCompletion(prompt: string, systemMessage: string = DEFAULT_SYSTEM_PROMPT) {
  try {
    const messages = [
      {
        role: "system" as const,
        content: systemMessage
      },
      {
        role: "user" as const,
        content: prompt
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error generating AI completion:', error);
    throw error;
  }
}

export async function generateCompletionMini(prompt: string, systemMessage: string = DEFAULT_SYSTEM_PROMPT) {
  const MAX_RETRIES = 2;
  let retryCount = 0;
  let lastError = null;

  while (retryCount <= MAX_RETRIES) {
    try {
      const messages = [
        {
          role: "system" as const,
          content: systemMessage
        },
        {
          role: "user" as const,
          content: prompt
        }
      ];

      console.log(`[AI-COMPLETION] Attempt ${retryCount + 1}/${MAX_RETRIES + 1} to generate completion`);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || null;
    } catch (error) {
      lastError = error;
      retryCount++;
      
      // Check if this is a rate limit error
      const isRateLimit = error instanceof Error && 
        (error.message.includes('Rate limit') || 
         error.message.includes('429') ||
         error.message.includes('Too Many Requests'));
      
      if (isRateLimit && retryCount <= MAX_RETRIES) {
        // Exponential backoff with jitter
        const delay = Math.min(1000 * (2 ** retryCount) + Math.random() * 1000, 10000);
        console.log(`[AI-COMPLETION] Rate limit hit, retrying in ${Math.round(delay/1000)}s (attempt ${retryCount}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error('Error generating AI completion:', error);
      
      if (retryCount <= MAX_RETRIES) {
        console.log(`[AI-COMPLETION] Retrying after error (attempt ${retryCount}/${MAX_RETRIES})`);
        // Simple delay before retry for non-rate-limit errors
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}