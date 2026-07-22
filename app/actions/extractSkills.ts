'use server';

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export interface ExtractSkillsResult {
  success: boolean;
  skills?: string[];
  error?: string;
  isFallback?: boolean;
}

// A dictionary of 80+ popular technologies to extract offline as a fallback
const POPULAR_TECHS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Sass', 'Less',
  'Vue', 'Angular', 'Svelte', 'Nuxt.js', 'Remix', 'Gatsby', 'SolidJS',
  'Node.js', 'Node', 'Express', 'FastAPI', 'Python', 'Go', 'Golang', 'Rust',
  'Java', 'Spring', 'Spring Boot', 'C++', 'C#', 'PHP', 'Laravel', 'Ruby', 'Rails',
  'Django', 'Flask', 'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'Cassandra',
  'Prisma', 'Drizzle', 'Sequelize', 'Mongoose', 'SQLite', 'Supabase', 'Firebase',
  'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'GCP', 'Azure', 'Vercel', 'Netlify',
  'Git', 'GitHub', 'GitLab', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Terraform',
  'GraphQL', 'Rest API', 'RESTful', 'WebSockets', 'Socket.io', 'gRPC', 'TRPC',
  'Tailwind CSS', 'Tailwind', 'Bootstrap', 'Material UI', 'MUI', 'Chakra UI',
  'Redux', 'Zustand', 'Recoil', 'MobX', 'Jotai', 'Webpack', 'Vite', 'Babel',
  'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'OpenCV', 'Jupyter',
  'Figma', 'Jest', 'Cypress', 'Playwright', 'Vitest', 'Testing Library'
];

/**
 * Fallback scanner that matches keywords in the resume text against a dictionary
 * of popular technologies. This guarantees 100% functionality offline/without API key.
 */
function scanResumeKeywords(text: string): string[] {
  const extracted = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const tech of POPULAR_TECHS) {
    // Regex boundary checks to prevent partial matching (e.g. matching 'Go' in 'Google')
    let pattern = new RegExp(`\\b${tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    
    // Custom handling for tech names with symbols (e.g. Next.js, Node.js, C++)
    if (tech === 'Next.js') pattern = /\bnext\.js\b/i;
    else if (tech === 'Node.js') pattern = /\bnode\.js\b/i;
    else if (tech === 'C++') pattern = /\bc\+\+\b/i;
    else if (tech === 'C#') pattern = /\bc#\b/i;
    else if (tech === '.NET') pattern = /\b\.net\b/i;
    
    if (pattern.test(lowerText)) {
      extracted.add(tech);
    }
  }

  return Array.from(extracted);
}

/**
 * Server action that accepts unstructured resume text and uses Gemini AI
 * to extract a clean, structured array of technical skills.
 */
export async function extractSkillsFromResume(resumeText: string): Promise<ExtractSkillsResult> {
  try {
    const trimmed = resumeText?.trim();
    if (!trimmed) {
      return {
        success: false,
        error: 'Please paste your resume text to extract skills.',
      };
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Resilient fallback mode if API key is not configured
    if (!apiKey) {
      return {
        success: true,
        skills: scanResumeKeywords(trimmed),
        isFallback: true,
      };
    }

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        skills: z
          .array(z.string())
          .describe(
            'An array of professional programming languages, libraries, frameworks, tools, databases, and platforms found in the text.'
          ),
      }),
      prompt: `You are an expert technical recruiter and ATS parsing agent. 
Scan the following unstructured resume text and extract all relevant technical skills. 

Technical skills include:
- Programming languages (e.g., Python, TypeScript, C++)
- Frameworks & libraries (e.g., React, Django, Next.js, PyTorch)
- Developer tools, databases, platforms, and cloud providers (e.g., Git, Docker, Postgres, AWS, Redis)

Do not include soft skills, non-technical words, or descriptions. Return only a clean, flat list of skills.

Resume Text:
"""
${trimmed}
"""`,
    });

    if (object?.skills && Array.isArray(object.skills)) {
      // Clean and normalize casing to match MOCK profiles or predefined skills
      const cleanedSkills = object.skills
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 30);

      return {
        success: true,
        skills: cleanedSkills,
      };
    }

    return {
      success: true,
      skills: scanResumeKeywords(trimmed),
      isFallback: true,
    };
  } catch (error) {
    console.error('Failed to extract skills using AI:', error);
    return {
      success: true,
      skills: scanResumeKeywords(resumeText),
      isFallback: true,
    };
  }
}
