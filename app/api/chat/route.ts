import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, userContext, isRoastMode } = await req.json();

    // Resilient simulated streaming fallback mode when API key is unconfigured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      const lastMessage = messages[messages.length - 1]?.content || 'Hello';
      
      let mockText = '';
      if (isRoastMode) {
        mockText = `🔥 ROAST: Wow, did you write this code or did a cat walk across your keyboard? Using nested loops or unstructured functions in 2026 is a crime in most states. It looks like you're trying to solve a simple problem with a high-complexity headache. Variable naming is so generic it could be a math homework sheet. 

🛠️ THE FIX: Let's optimize this with a clean, modern ES6 approach:
\`\`\`javascript
// Optimized O(N) lookup
const uniqueSkills = Array.from(new Set(userSkills));
console.log("Job-ready profile:", uniqueSkills);
\`\`\`
This runs in linear time and respects modular design! Let me know if you want me to roast another snippet!`;
      } else {
        mockText = `As your AI Career Mentor, let's break down this request: "${lastMessage}".

Here are the modern best practices to implement this architecture:
1. **Zustand Store**: Centralize state handlers to prevent redundant component re-renders.
2. **Modular Services**: Separate data transformations into clean utilities.
3. **Database Syncing**: Always execute server-side database sync asynchronously or inside transitions.

Let me know if you would like a code snippet or a step-by-step roadmap for this feature!`;
      }

      const textEncoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const words = mockText.split(' ');
          for (const word of words) {
            controller.enqueue(textEncoder.encode(word + ' '));
            await new Promise((resolve) => setTimeout(resolve, 60)); // Simulated streaming speed
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    let systemPrompt = `You are an elite, highly experienced AI Career Mentor and Senior Software Engineer. 
Your goal is to guide the user to become job-ready by answering their questions, debugging their code, and providing strategic roadmap advice.
Keep your responses concise, highly practical, and focused on modern best practices (React, Next.js, Node.js, AI, etc.).

Context about the user:
- Name: ${userContext?.name || 'User'}
- Goal Role: ${userContext?.careerGoal || 'Fullstack Developer'}
- Skills: ${(userContext?.skills || []).join(', ') || 'Beginner'}

Do NOT use markdown headers unnecessarily. Use bolding and code blocks where helpful. 
Respond directly to the user's latest query based on the conversation history.`;

    if (isRoastMode) {
      systemPrompt = `You are a sarcastic, witty, and slightly cynical Senior Software Engineer.
When the user pastes code or asks a question, playfully and humorously roast their code quality, naming conventions, inefficiencies, or logic flaws. 
Make the roast funny and entertaining, but never genuinely mean.
AFTER the roast, shift gears and provide the actual technically optimized, corrected solution with clear explanations.

Context about the user:
- Name: ${userContext?.name || 'User'}
- Goal Role: ${userContext?.careerGoal || 'Fullstack Developer'}
- Skills: ${(userContext?.skills || []).join(', ') || 'Beginner'}

Format your response so that the roast section stands out (e.g. starting with "🔥 ROAST:" or "💻 THE CRITIQUE:"), followed by the constructive "🛠️ THE FIX" section containing the correct solution and code blocks.`;
    }

    // Gemini strictly requires the first message to be from the user.
    // We strip out any leading 'assistant' messages from the conversation history.
    const validMessages = [...messages];
    while (validMessages.length > 0 && validMessages[0].role === 'assistant') {
      validMessages.shift();
    }

    const result = await streamText({
      model: google('gemini-flash-lite-latest'),
      system: systemPrompt,
      messages: validMessages,
    });

    console.log('Sending text stream response...');
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return new Response(JSON.stringify({ error: error?.toString() || 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
