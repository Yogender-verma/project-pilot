'use server';

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export interface GenerateTweetResult {
  success: boolean;
  tweet?: string;
  error?: string;
  isFallback?: boolean;
}

export interface ProjectTweetInput {
  title: string;
  description: string;
  technologies: string[];
}

const TWEET_CHAR_LIMIT = 280;

/**
 * Builds a simple, safe fallback tweet when the AI API key isn't configured
 * or the model output can't be trusted to fit the character limit.
 */
function generateFallbackTweet({ title, technologies }: ProjectTweetInput): string {
  const stack = technologies.slice(0, 3).join(', ') || 'modern web tech';
  const tweet = `🚀 Just shipped "${title}"! Built with ${stack}. Excited to keep building in public. #buildinpublic #webdev #coding`;
  return tweet.length > TWEET_CHAR_LIMIT ? tweet.slice(0, TWEET_CHAR_LIMIT - 1) + '…' : tweet;
}

/**
 * Server action that asks the LLM to summarize a completed project into a
 * single engaging tweet (<=280 characters) with relevant hashtags/emojis.
 */
export async function generateProjectTweet(project: ProjectTweetInput): Promise<GenerateTweetResult> {
  try {
    if (!project?.title) {
      return { success: false, error: 'Project title is required to generate a tweet.' };
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return {
        success: true,
        tweet: generateFallbackTweet(project),
        isFallback: true,
      };
    }

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        tweet: z
          .string()
          .max(TWEET_CHAR_LIMIT)
          .describe('An engaging Twitter/X post, 280 characters or fewer, including hashtags and emojis.'),
      }),
      prompt: `You are a social media growth expert for developers. Write ONE engaging Twitter/X post announcing that a developer just completed a project.

Project title: "${project.title}"
Description: "${project.description || 'No description provided.'}"
Tech stack: ${project.technologies?.join(', ') || 'Not specified'}

Strict rules:
- The tweet MUST be 280 characters or fewer, including spaces, emojis, and hashtags.
- Include 2-4 relevant hashtags (e.g. #buildinpublic, #webdev, or hashtags based on the tech stack).
- Include 1-3 relevant emojis.
- Sound genuinely excited and human, not robotic or generic.
- Do not use quotation marks around the tweet.`,
    });

    const tweet = object?.tweet?.trim();

    if (tweet && tweet.length > 0 && tweet.length <= TWEET_CHAR_LIMIT) {
      return { success: true, tweet };
    }

    return {
      success: true,
      tweet: generateFallbackTweet(project),
      isFallback: true,
    };
  } catch (error) {
    console.error('Failed to generate project tweet via AI:', error);
    return {
      success: true,
      tweet: generateFallbackTweet(project),
      isFallback: true,
    };
  }
}