import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_SYSTEM_PROMPT = `You are Kalypso, a friendly AI cat tutor. Be encouraging but direct, keep responses under 100 words.`;

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
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error generating AI completion:', error);
    throw error;
  }
}