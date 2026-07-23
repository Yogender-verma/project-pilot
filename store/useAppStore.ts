import { create } from 'zustand';
import { toast } from 'sonner';
import { 
  User, 
  OnboardingData, 
  Project, 
  Roadmap, 
  ChatConversation, 
  ChatMessage, 
  GitHubAnalytics, 
  CareerScore,
  ProjectActivity
} from '../types';

import { generateAdaptiveDashboard } from '@/lib/adaptiveEngine';
import { toggleProjectMilestoneInDb, createActivityInDb, saveProjectToDb } from '@/app/actions/projectActions';
import { createOnboardingSlice, OnboardingSlice } from "./slices/onboardingSlice";
import { createAuthSlice, AuthSlice } from "./slices/authSlice";
import { createProjectSlice, ProjectSlice } from "./slices/projectSlice";
import { createChatSlice, ChatSlice } from "./slices/chatSlice";
import { createGithubSlice, GithubSlice } from "./slices/githubSlice";
import { createCareerSlice, CareerSlice } from "./slices/careerSlice";

// Neutral placeholder used before the authenticated user profile is hydrated from the DB.
// This is intentionally empty — real data flows in via syncUserProfile() on mount.
const DEFAULT_USER: User = {
  id: 'user-yogender',
  name: 'Yogender Verma',
  username: 'yogender-verma',
  email: 'yogendarverma0268@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
  careerGoal: 'AI Engineer',
  skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
  portfolioPublic: false,
  githubUrl: '',
  linkedinUrl: '',
  resumeUrl: '',
};

const initialAdaptive = generateAdaptiveDashboard(DEFAULT_USER);

// Initial projects list (populated with neutral defaults before auth hydration)
const MOCK_PROJECTS: Project[] = initialAdaptive.projects;

// Initial state for Roadmaps
const INITIAL_ROADMAPS: Record<string, Roadmap> = {
  'project-1': {
    projectId: 'project-1',
    projectTitle: 'OmniAI Agentic Dashboard',
    steps: [
      {
        id: 'step-1',
        title: 'System Design & Base Shell Setup',
        duration: 'Days 1–3',
        description: 'Define agent schema, set up Next.js 15 dashboard shell, create Zustand state controls, and design standard layout.',
        tasks: [
          'Design Tailwind glassmorphic dashboard container framework',
          'Configure Zustand store to hold Agent statuses (Idle, Running, Completed, Errored)',
          'Install dependencies (Framer Motion, Recharts, Lucide Icons)',
          'Draft database schemas for storing Agent run logs'
        ],
        completed: true,
        type: 'fundamentals'
      },
      {
        id: 'step-2',
        title: 'Core AI Agent Coordination Layer',
        duration: 'Days 4–7',
        description: 'Establish backend API routes, configure OpenAI Assistant/LangChain orchestrators, and implement tool execution gates.',
        tasks: [
          'Create Next.js Server Actions or API routes interacting with OpenAI Assistants API',
          'Build standard tool parsing logic (takes agent tool requests, checks permission, returns results)',
          'Establish a streaming service (Server-Sent Events or WebSockets) for real-time tokens',
          'Implement LLM structured output parsing using Zod models'
        ],
        completed: true,
        type: 'backend'
      },
      {
        id: 'step-3',
        title: 'Real-Time Visualization & Whiteboard Canvas',
        duration: 'Days 8–12',
        description: 'Build the interactive agent decision tree and standard console output streams.',
        tasks: [
          'Create a canvas view or custom graph drawing component showing active node states',
          'Implement real-time scrolling console terminal for logs and tool-outputs',
          'Create animated Recharts widgets plotting token counts and response latencies',
          'Add smooth Framer Motion transitions for agent card statuses'
        ],
        completed: false,
        type: 'frontend'
      },
      {
        id: 'step-4',
        title: 'Vector Embedding & Memory Drawer',
        duration: 'Days 13–16',
        description: 'Connect vector store database (Pinecone/Supabase) to store agent memory logs and perform semantic search queries.',
        tasks: [
          'Create a helper API chunking agent actions and sending embeddings to Pinecone',
          'Design a "Memory Drawer" panel letting users type questions to scan agent\'s brain',
          'Add a "Resume Value Analyzer" checking how many resume-impact bullet points are achieved',
          'Add security middleware to prevent API token leak vulnerabilities'
        ],
        completed: false,
        type: 'integration'
      },
      {
        id: 'step-5',
        title: 'Docker Sandbox & Production Deployment',
        duration: 'Days 17–20',
        description: 'Bundle backend in Docker, optimize Next.js assets for final Vercel deployment, and test edge latency scores.',
        tasks: [
          'Write a clean Dockerfile packaging FastAPI backend sandboxes securely',
          'Deploy frontend to Vercel and backend server to Railway or AWS',
          'Configure custom domain, SSL certificates, and check performance scores (Lighthouse)',
          'Launch project and share github repository link with ProjectPilot AI'
        ],
        completed: false,
        type: 'deployment'
      }
    ]
  }
};

// Initial Chat Conversations
const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    title: 'New Conversation',
    lastUpdated: new Date(),
    messages: [
      {
        id: 'msg-init-1',
        role: 'assistant',
        content: 'Hello! I am your AI Career Mentor. Ask me anything about your recommended projects, how to fill skill gaps, structuring your github portfolio, or preparing for interviews with recruiters!',
        timestamp: new Date()
      }
    ]
  }
];

// Initial GitHub Analytics Mock Data
const MOCK_GITHUB: GitHubAnalytics = {
  username: 'Yogender-verma',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
  totalRepos: 8,
  totalCommits: 342,
  consistencyScore: 78,
  portfolioStrengthScore: 68,
  aiEngineerReadiness: 62,
  connected: true,
  languages: [
    { name: 'TypeScript', value: 45, color: '#3178c6' },
    { name: 'JavaScript', value: 30, color: '#f1e05a' },
    { name: 'HTML/CSS', value: 15, color: '#e34c26' },
    { name: 'Python', value: 10, color: '#3572A5' }
  ],
  recentCommits: [
    { day: 'Mon', commits: 5 },
    { day: 'Tue', commits: 12 },
    { day: 'Wed', commits: 8 },
    { day: 'Thu', commits: 20 },
    { day: 'Fri', commits: 6 },
    { day: 'Sat', commits: 2 },
    { day: 'Sun', commits: 14 }
  ],
  skillDetection: [
    'UI Architecture', 'Frontend Development', 'React Ecosystem', 'Product Thinking', 'Beginner AI Exposure'
  ],
  growthRecommendations: [
    'Build an AI RAG assistant',
    'Create multi-agent workflows',
    'Learn FastAPI and Python fundamentals',
    'Build AI deployment pipelines',
    'Learn embeddings and vector databases'
  ],
  recruiterInsights: [
    'You already demonstrate strong frontend and product-thinking capabilities through projects like ProjectPilot-AI and HUSON.',
    'Your strengths include: UI-driven development, student-focused platforms, practical problem solving, and rapid project execution.',
    'To become highly job-ready as an AI Engineer, your next growth focus should be: Python ecosystem, Machine Learning fundamentals, LLM workflows, and Vector databases.',
    'Your current portfolio already shows strong initiative and hackathon-level innovation potential.'
  ],
  repositoryIntelligence: [
    {
      name: 'ProjectPilot-AI',
      description: 'An ambitious AI SaaS architecture with a scalable mentor concept.',
      analysis: ['Ambitious AI SaaS architecture', 'Strong product vision', 'Modern frontend stack', 'Scalable mentor concept'],
      detectedSkills: ['TypeScript', 'Next.js', 'UI Architecture', 'AI Product Thinking'],
      growthRecommendation: ['Focus on backend orchestration', 'AI memory systems', 'Vector search API integration'],
      stars: 14,
      forks: 3,
      lang: 'TypeScript'
    },
    {
      name: 'DoubtSpace',
      description: 'Educational platform architecture focusing on solving student doubts.',
      analysis: ['Student-focused platform', 'Practical utility', 'Frontend-heavy structure', 'Clear user workflows'],
      detectedSkills: ['JavaScript', 'React', 'Frontend Routing', 'State Management'],
      growthRecommendation: ['Add authentication', 'Backend persistence', 'AI-powered auto-responses'],
      stars: 8,
      forks: 1,
      lang: 'JavaScript'
    },
    {
      name: 'JanSetu',
      description: 'Civic management and tracking platform.',
      analysis: ['Public utility concept', 'Data management potential', 'Clean UI implementation'],
      detectedSkills: ['HTML/CSS', 'JavaScript', 'Responsive Design'],
      growthRecommendation: ['Implement backend persistence', 'Add mapping/geolocation features'],
      stars: 12,
      forks: 4,
      lang: 'JavaScript'
    },
    {
      name: 'HUSON',
      description: 'Innovative student and utility focused application.',
      analysis: ['Strong product thinking', 'Rapid execution', 'UI-driven development'],
      detectedSkills: ['React', 'CSS Frameworks', 'Prototyping'],
      growthRecommendation: ['Scale the backend architecture', 'Implement scalable databases'],
      stars: 6,
      forks: 0,
      lang: 'TypeScript'
    },
    {
      name: 'CodeAlpha-Image-Gallery',
      description: 'Visually focused image gallery and media handling project.',
      analysis: ['Visual UI/UX focus', 'Media asset management', 'Grid layouts'],
      detectedSkills: ['HTML', 'CSS Grid', 'JavaScript'],
      growthRecommendation: ['Implement lazy loading', 'Add AI image tagging'],
      stars: 4,
      forks: 1,
      lang: 'HTML/CSS'
    },
    {
      name: 'TicketEasy',
      description: 'Ticketing system focused on seamless event/task booking.',
      analysis: ['Transactional workflows', 'Form management', 'Practical problem solving'],
      detectedSkills: ['TypeScript', 'Form Validation', 'State Management'],
      growthRecommendation: ['Integrate Stripe API', 'Add QR code generation'],
      stars: 5,
      forks: 2,
      lang: 'TypeScript'
    },
    {
      name: 'Gamified_Learning',
      description: 'Interactive learning platform using game mechanics.',
      analysis: ['Engagement-driven design', 'Interactive states', 'Complex UI logic'],
      detectedSkills: ['React', 'Gamification Logic', 'CSS Animations'],
      growthRecommendation: ['Add real-time multiplayer', 'Implement global leaderboards'],
      stars: 9,
      forks: 1,
      lang: 'JavaScript'
    },
    {
      name: 'Smart-Expiry-Tracker',
      description: 'Utility app for tracking expirations and notifying users.',
      analysis: ['Utility-driven architecture', 'Time-based data handling', 'Notification workflows'],
      detectedSkills: ['JavaScript', 'Date/Time Logic', 'CRUD Operations'],
      growthRecommendation: ['Add CRON jobs', 'Implement push notifications'],
      stars: 7,
      forks: 0,
      lang: 'JavaScript'
    }
  ]
};

// Initial Career Score Mock Data
const MOCK_CAREER: CareerScore = initialAdaptive.careerScore;

export interface AppStore
  extends OnboardingSlice,
    AuthSlice,
    ProjectSlice,
    ChatSlice,
    GithubSlice,
    CareerSlice {
  // Onboarding State
  onboardingData: OnboardingData;
  onboardingStep: number;
  setOnboardingField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  setOnboardingStep: (step: number) => void;
  resetOnboarding: () => void;

  // GitHub Analytics State
githubAnalytics: GitHubAnalytics;
connectGithub: (username: string) => Promise<void>;
disconnectGithub: () => void;


  // Career Score State
  careerScore: CareerScore;
  recalculateCareerScore: () => void;
}

export const useAppStore = create<AppStore>()((set, get, api) => ({
  ...createOnboardingSlice(set, get, api),
  ...createAuthSlice(set, get, api),
  ...createProjectSlice(
  MOCK_PROJECTS,
  INITIAL_ROADMAPS
)(set, get, api),
  ...createChatSlice(
  INITIAL_CONVERSATIONS,
  DEFAULT_USER
)(set, get, api),
  ...createGithubSlice(MOCK_GITHUB)(set, get, api),
  ...createCareerSlice(MOCK_CAREER)(set, get, api),
}));
