import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
const {
              messages,
              userContext,
              isRoastMode,
              isMockInterview,
              endInterview,
              translateLanguage, } = await req.json();
    // Resilient simulated streaming fallback mode when API key is unconfigured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      const lastMessage = messages[messages.length - 1]?.content || 'Hello';
      
      let mockText = '';
      if (isMockInterview) {
        const primarySkill = userContext?.skills?.[0] || userContext?.careerGoal || 'software development';
        mockText = endInterview
          ? '## Final Interview Report\n\nOverall Score: 7/10\n\nStrengths: Demonstrates a solid foundation and communicates technical trade-offs clearly.\n\nWeaknesses: Some answers would benefit from deeper implementation detail.\n\nTopics to Improve: Practice explaining ' + primarySkill + ' concepts with concrete examples and edge cases.\n\nHiring Recommendation: Continue strengthening the identified areas before a final technical round.'
          : /^start a .+ mock interview\.$/i.test(lastMessage.trim())
            ? 'Question #1\nDifficulty: Medium\n\nHow would you apply your knowledge of ' + primarySkill + ' to solve a practical problem for this role?'
            : 'Score: 7/10\n\nYour answer shows a useful foundation. To improve it, explain the trade-offs and include a concrete implementation example.\n\nQuestion #2\nDifficulty: Medium\n\nWhat is one important performance or reliability consideration when working with ' + primarySkill + '?';
      } else if (isRoastMode) {
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
            await new Promise((resolve) => setTimeout(resolve, 40));
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
    } else if (isMockInterview) {
      systemPrompt = `You are an experienced Senior Software Engineering Hiring Manager conducting a technical interview.

Candidate Profile:
- Name: ${userContext?.name || 'User'}
- Target Role: ${userContext?.careerGoal || 'Software Developer'}
- Skills: ${(userContext?.skills || []).join(', ') || 'Beginner'}

Interview Rules:
1. Stay in the role of a professional hiring manager.
2. Ask EXACTLY ONE technical interview question at a time.
3. Wait for the candidate's response before asking another question.
4. Every question must be based on the candidate's Target Role and Skills.
5. After each answer:
   - Give a score out of 10 for ONLY that answer.
   - Explain what was correct.
   - Explain what could be improved.
   - Then ask ONE new question.
6. Never ask multiple questions in one response.
7. Never reveal future questions.
8. Maintain interview continuity using the previous conversation history.
9. If the latest user message starts with "Start a" and ends with "mock interview.", treat it as setup, do not score it, and ask Question #1 only.
10. For each candidate answer after Question #1, provide feedback and a line formatted exactly as "Score: X/10", then ask exactly one next question.

${
  endInterview
    ? `The candidate has ended the interview.
DO NOT ask another question or provide per-question feedback.
Instead provide a final report using these exact headings, each with a concise value:
Overall Score: X/10
Strengths:
Weaknesses:
Topics to Improve:
Hiring Recommendation:`
    : ""
}`;
    }

// If the user picked a translate language, append instructions so every
    // future response is written in that language, except code stays in English.
    if (translateLanguage) {
      systemPrompt += `\n\nIMPORTANT LANGUAGE INSTRUCTION: You are an expert AI mentor. Please provide all responses in conversational ${translateLanguage}, while keeping code blocks, variable names, and syntax in standard English.`;
    }

    // Gemini strictly requires the first message to be from the user.    const validMessages = [...messages];
    while (validMessages.length > 0 && validMessages[0].role === 'assistant') {
      validMessages.shift();
    }

    // Use streamText and return a text stream response
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages: validMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to generate response',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
