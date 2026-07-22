'use server';

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export interface SuggestNamesResult {
  success: boolean;
  names?: string[];
  error?: string;
  isFallback?: boolean;
}

/**
 * Fallback name generator that constructs 5 catchy project names
 * from user keywords when AI API key is unconfigured or offline.
 */
function generateFallbackNames(keywords: string): string[] {
  const cleanKeywords = keywords
    .split(/[\s,]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);

  if (cleanKeywords.length === 0) {
    cleanKeywords.push('Pilot');
  }

  const formatWord = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  const words = cleanKeywords.map(formatWord);
  
  const primary = words[0];
  const secondary = words[1] || '';
  const tertiary = words[2] || '';

  // A massive pool of creative, tech-forward, and futuristic prefixes
  const techPrefixes = [
    'Nova', 'Apex', 'Zenith', 'Echo', 'Velo', 'Aero', 'Hexa', 'Neo',
    'Quantum', 'Helix', 'Nexus', 'Vertex', 'Optima', 'Prism', 'Orbit',
    'Flux', 'Core', 'Vortex', 'Kinetix', 'Lyra', 'Siren', 'Grid', 'Hyper',
    'Synapse', 'Neuro', 'Cipher', 'Pulsar', 'Aether', 'Spectral', 'Omni',
    'Integra', 'Lumina', 'Stratis', 'Aura', 'Vivid', 'Catalyst', 'Synthetix',
    'Cortex', 'Vector', 'Proto', 'Chronos', 'Axiom', 'Cyber', 'Cogni',
    'Holo', 'Meta', 'Volt', 'Spectra', 'Atlas', 'Orion', 'Sigma', 'Stellar',
    'Titan', 'Byte', 'Bit', 'Macro', 'Micro', 'Nano', 'Giga', 'Terra',
    'Solar', 'Cosmo', 'Strato', 'Pico', 'Infini', 'Zero', 'One', 'Syncro',
    'Hydro', 'Pyro', 'Cryo', 'Geo', 'Bio', 'Astro', 'Krypto', 'Quantum'
  ];

  // A massive pool of creative tech-focused suffixes
  const techSuffixes = [
    'Forge', 'Vault', 'Lab', 'Base', 'Grid', 'Link', 'Node', 'Wire', 'Flow', 'Pulse',
    'Sync', 'Pilot', 'Engine', 'Craft', 'Stack', 'Hub', 'Loop', 'Wave', 'Core', 'Block',
    'Net', 'Sphere', 'Matrix', 'Dock', 'Shift', 'Scale', 'Smith', 'Works', 'Labs',
    'Line', 'Point', 'Edge', 'Span', 'Path', 'Way', 'Trace', 'Track', 'Rise', 'Drift',
    'Glide', 'Sprint', 'Run', 'Dash', 'Gate', 'Key', 'Lock', 'Pass', 'Port', 'Bay',
    'Cove', 'Ridge', 'Peak', 'Crest', 'Meld', 'Merge', 'Blend', 'Weave', 'Knit',
    'Thread', 'String', 'Chain', 'Link', 'Bind', 'Fuse', 'Cast', 'Mold', 'Print'
  ];

  // Helper to shuffle arrays
  const shuffle = <T>(arr: T[]): T[] => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  const shuffledPrefixes = shuffle(techPrefixes);
  const shuffledSuffixes = shuffle(techSuffixes);

  const candidates: string[] = [];

  // 1. Classic Compound (if secondary exists)
  if (secondary) {
    candidates.push(`${primary}${secondary}`);
    candidates.push(`${secondary}${primary}`);
  }

  // 2. Prefixes + Keywords
  candidates.push(`${shuffledPrefixes[0]}${primary}`);
  candidates.push(`${shuffledPrefixes[1]}${primary}`);

  // 3. Keywords + Suffixes
  candidates.push(`${primary}${shuffledSuffixes[0]}`);
  candidates.push(`${primary}${shuffledSuffixes[1]}`);

  // 4. Blended word (abbreviation)
  if (secondary && secondary.length >= 3) {
    candidates.push(`${primary}${secondary.slice(0, 3)}`);
  }

  // 5. Integrations of secondary/tertiary keywords
  if (secondary) {
    candidates.push(`${shuffledPrefixes[2]}${secondary}`);
    candidates.push(`${secondary}${shuffledSuffixes[2]}`);
  }
  if (tertiary) {
    candidates.push(`${primary}${tertiary}`);
    candidates.push(`${shuffledPrefixes[3]}${tertiary}`);
    candidates.push(`${tertiary}${shuffledSuffixes[3]}`);
  }

  // 6. Multi-word spaced names
  candidates.push(`${primary} ${shuffledSuffixes[4]}`);
  if (secondary) {
    candidates.push(`${shuffledPrefixes[4]} ${secondary}`);
  }

  // Ensure we have plenty of unique candidates to sample from
  let fallbackIdx = 5;
  while (candidates.length < 15) {
    candidates.push(`${primary}${shuffledSuffixes[fallbackIdx++] || 'App'}`);
  }

  // Deduplicate and return 5 random choices
  const uniqueCandidates = Array.from(new Set(candidates));
  return shuffle(uniqueCandidates).slice(0, 5);
}

/**
 * Server action querying Google Gemini via Vercel AI SDK to generate 5 project names
 * based on input keywords, enforced by a strict Zod schema.
 */
export async function suggestProjectNames(keywords: string): Promise<SuggestNamesResult> {
  try {
    const trimmed = keywords?.trim();
    if (!trimmed) {
      return {
        success: false,
        error: 'Please provide at least 1–2 keywords to generate project names.',
      };
    }

    // Check if Google AI API key is configured
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return {
        success: true,
        names: generateFallbackNames(trimmed),
        isFallback: true,
      };
    }

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        names: z
          .array(z.string())
          .length(5)
          .describe('An array of exactly 5 creative, catchy, modern software project names.'),
      }),
      prompt: `You are a world-class tech startup and open-source project naming specialist.
Given the following keywords describing a software project, generate exactly 5 creative, catchy, modern, and memorable software project names suitable for GitHub repositories or SaaS products.

Keywords: "${trimmed}"

Guidelines:
- Each name should be 1-3 words max or a single catchy compound word (e.g. "DevPulse", "OmniChat", "EchoStack").
- Names should sound professional, modern, and tech-forward.
- Do not add numbers or generic dates.`,
    });

    if (object?.names && Array.isArray(object.names) && object.names.length === 5) {
      return {
        success: true,
        names: object.names,
      };
    }

    // Fallback if LLM output length was incomplete
    return {
      success: true,
      names: generateFallbackNames(trimmed),
      isFallback: true,
    };
  } catch (error) {
    console.error('Failed to generate project names via AI:', error);
    // Return resilient fallback rather than crashing UI
    return {
      success: true,
      names: generateFallbackNames(keywords || 'Project'),
      isFallback: true,
    };
  }
}
