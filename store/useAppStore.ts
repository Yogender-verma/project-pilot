import { create } from 'zustand';
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

// Neutral placeholder used before the authenticated user profile is hydrated from the DB.
// This is intentionally empty — real data flows in via syncUserProfile() on mount.
const DEFAULT_USER: User = {
  id: 'user-yogender',
  name: 'Yogender Verma',
  email: 'yogendarverma0268@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
  careerGoal: 'AI Engineer',
  skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']
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

interface AppStore {
  // Onboarding State
  onboardingData: OnboardingData;
  onboardingStep: number;
  setOnboardingField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  setOnboardingStep: (step: number) => void;
  resetOnboarding: () => void;

  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name: string) => void;
  signup: (email: string, name: string, careerGoal: string) => void;
  logout: () => void;
  updateProfile: (name: string, email: string, careerGoal: string) => void;
  updateAvatar: (avatarUrl: string) => void;
  updateUserSkills: (skills: string[]) => void;
  syncUserProfile: (dbUser: any) => void;

  // Projects State
  projects: Project[];
  selectedProjectId: string | null;
  setProjects: (projects: Project[]) => void;
  selectProject: (id: string | null) => void;

  // Project Activity State
  activities: ProjectActivity[];
  setActivities: (activities: ProjectActivity[]) => void;

  // Roadmaps State
  roadmaps: Record<string, Roadmap>;
  toggleStepCompletion: (projectId: string, stepId: string) => void;
  toggleTaskCompletion: (projectId: string, stepId: string, taskIndex: number) => void;
  initializeRoadmap: (projectId: string, title: string) => void;

  // Chat State
  conversations: ChatConversation[];
  activeConversationId: string | null;
  isRoastMode: boolean;
  toggleRoastMode: () => void;
  sendMessage: (content: string, codeSnippet?: { language: string; code: string }, attachments?: { name: string; size: string; type: string }[]) => void;
  createNewConversation: (title?: string) => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;

  // GitHub Analytics State
  githubAnalytics: GitHubAnalytics;
  connectGithub: (username: string) => void;
  disconnectGithub: () => void;

  // Career Score State
  careerScore: CareerScore;
  recalculateCareerScore: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Onboarding state
  onboardingData: {
    fullName: '',
    email: '',
    experienceLevel: 'intermediate',
    dreamRole: 'AI Engineer',
    skills: [],
    resumeFile: null,
    resumeName: null,
    githubUrl: '',
    linkedinUrl: '',
    availableHoursPerWeek: 15,
  },
  onboardingStep: 1,
  setOnboardingField: (field, value) => set((state) => ({
    onboardingData: {
      ...state.onboardingData,
      [field]: value
    }
  })),
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  resetOnboarding: () => set({
    onboardingStep: 1,
    onboardingData: {
      fullName: '',
      email: '',
      experienceLevel: 'intermediate',
      dreamRole: 'AI Engineer',
      skills: [],
      resumeFile: null,
      resumeName: null,
      githubUrl: '',
      linkedinUrl: '',
      availableHoursPerWeek: 15,
    }
  }),

  // Auth State
  user: DEFAULT_USER,
  isAuthenticated: true, // Auto-logged in for rich demo out of the box
  login: (email, name) => {
    const newUser = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name: name || email?.split('@')[0] || 'User',
      email: email || '',
      avatarUrl: '',
      careerGoal: 'fullstack',
      skills: []
    };
    const adaptive = generateAdaptiveDashboard(newUser);
    set((state) => ({
      isAuthenticated: true,
      user: newUser,
      careerScore: adaptive.careerScore,
      projects: adaptive.projects,
      githubAnalytics: { ...state.githubAnalytics, recruiterInsights: adaptive.insights }
    }));
  },
  signup: (email, name, careerGoal) => {
    const newUser = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name: name || email?.split('@')[0] || 'User',
      email: email || '',
      avatarUrl: '',
      careerGoal: careerGoal || 'fullstack',
      skills: []
    };
    const adaptive = generateAdaptiveDashboard(newUser);
    set((state) => ({
      isAuthenticated: true,
      user: newUser,
      careerScore: adaptive.careerScore,
      projects: adaptive.projects,
      githubAnalytics: { ...state.githubAnalytics, recruiterInsights: adaptive.insights }
    }));
  },
  logout: () => set({ user: null, isAuthenticated: false }),
  updateProfile: (name, email, careerGoal) => set((state) => {
    if (!state.user) return {};
    const updatedUser = { ...state.user, name, email, careerGoal };
    const adaptive = generateAdaptiveDashboard(updatedUser);
    return {
      user: updatedUser,
      careerScore: adaptive.careerScore,
      projects: adaptive.projects,
      githubAnalytics: { ...state.githubAnalytics, recruiterInsights: adaptive.insights }
    };
  }),
  updateAvatar: (avatarUrl) => set((state) => {
    if (!state.user) return {};
    const updatedUser = { ...state.user, avatarUrl };
    const adaptive = generateAdaptiveDashboard(updatedUser);
    return {
      user: updatedUser,
      careerScore: adaptive.careerScore,
      projects: adaptive.projects,
      githubAnalytics: { ...state.githubAnalytics, recruiterInsights: adaptive.insights }
    };
  }),
  updateUserSkills: (skills) => set((state) => {
    if (!state.user) return {};
    const updatedUser = { ...state.user, skills };
    const adaptive = generateAdaptiveDashboard(updatedUser);
    return {
      user: updatedUser,
      careerScore: adaptive.careerScore,
      projects: adaptive.projects,
      githubAnalytics: { ...state.githubAnalytics, recruiterInsights: adaptive.insights }
    };
  }),
  syncUserProfile: (dbUser) => {
    if (!dbUser) return;
    set((state) => {
      const updatedUser = {
        id: dbUser.clerkId || dbUser.id || '',
        name: dbUser.fullName || dbUser.email?.split('@')[0] || 'Anonymous User',
        email: dbUser.email || '',
        avatarUrl: dbUser.imageUrl || '',
        careerGoal: dbUser.dreamRole || 'fullstack',
        skills: dbUser.skills || []
      };
      const adaptive = generateAdaptiveDashboard(updatedUser);
      
      const dbProjects = dbUser.projects || [];
      const adaptiveProjects = adaptive.projects;
      
      const mergedProjects = adaptiveProjects.map(ap => {
        const dbProj = dbProjects.find((dp: any) => dp.id === ap.id);
        if (dbProj) {
          return {
            ...ap,
            status: dbProj.status,
            progress: dbProj.progress,
            createdAt: dbProj.createdAt,
            updatedAt: dbProj.updatedAt,
          };
        }
        return ap;
      });

      const dbActivities: ProjectActivity[] = dbProjects.flatMap((dp: any) =>
        (dp.activities || []).map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          projectId: activity.projectId,
          projectTitle: dp.title,
          createdAt: new Date(activity.createdAt).toISOString(),
        }))
      ).sort((a: ProjectActivity, b: ProjectActivity) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const updatedRoadmaps = { ...state.roadmaps };
      dbProjects.forEach((dp: any) => {
        if (dp.roadmap) {
          try {
            const steps = typeof dp.roadmap === 'string' ? JSON.parse(dp.roadmap) : dp.roadmap;
            updatedRoadmaps[dp.id] = {
              projectId: dp.id,
              projectTitle: dp.title,
              steps: steps
            };
          } catch (e) {
            console.error('Failed to parse database project roadmap:', e);
          }
        }
      });

      return {
        isAuthenticated: true,
        user: updatedUser,
        careerScore: adaptive.careerScore,
        projects: mergedProjects,
        roadmaps: updatedRoadmaps,
        activities: dbActivities,
        githubAnalytics: { ...state.githubAnalytics, recruiterInsights: adaptive.insights }
      };
    });
  },

  // Projects State
  projects: MOCK_PROJECTS,
  selectedProjectId: 'project-1',
  setProjects: (projects) => set({ projects }),
  selectProject: (id) => set({ selectedProjectId: id }),

  // Project Activity State
  activities: [],
  setActivities: (activities) => set({ activities }),

  // Roadmaps State
  roadmaps: INITIAL_ROADMAPS,
  toggleStepCompletion: (projectId, stepId) => set((state) => {
    const roadmap = state.roadmaps[projectId];
    if (!roadmap) return {};
    let isCompleted = false;
    let stepTitle = '';
    const updatedSteps = roadmap.steps.map((step) => {
      if (step.id === stepId) {
        isCompleted = !step.completed;
        stepTitle = step.title;
        return {
          ...step,
          completed: isCompleted
        };
      }
      return step;
    });

    const completedCount = updatedSteps.filter(s => s.completed).length;
    const progress = Math.round((completedCount / updatedSteps.length) * 100);

    // Sync changes to the database
    toggleProjectMilestoneInDb(projectId, stepId, updatedSteps, progress);
    const projectTitle = state.projects.find((project) => project.id === projectId)?.title;
    const newActivity: ProjectActivity | null = isCompleted ? {
      id: `local-${Date.now()}-${stepId}`,
      type: 'milestone',
      description: `Completed milestone: ${stepTitle}`,
      projectId,
      projectTitle,
      createdAt: new Date().toISOString(),
    } : null;

    if (isCompleted) {
      createActivityInDb(projectId, `Completed milestone: ${stepTitle}`, 'milestone');
    }

    return {
      roadmaps: {
        ...state.roadmaps,
        [projectId]: {
          ...roadmap,
          steps: updatedSteps
        }
      },
      activities: newActivity ? [newActivity, ...state.activities] : state.activities,
      projects: state.projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            progress,
            status: progress === 100 ? 'Completed' : 'In Progress'
          };
        }
        return p;
      })
    };
  }),
  toggleTaskCompletion: (projectId, stepId, taskIndex) => set((state) => {
    const roadmap = state.roadmaps[projectId];
    if (!roadmap) return {};

    const updatedSteps = roadmap.steps.map((step) => {
      if (step.id === stepId) {
        // Toggling step completion directly for clean UX
      }
      return step;
    });

    return {};
  }),
  initializeRoadmap: (projectId, title) => set((state) => {
    if (state.roadmaps[projectId]) return {}; // Already exists

    const newSteps = [
      {
        id: 'step-1',
        title: 'Project Inception & Architecture Planning',
        duration: 'Days 1-2',
        description: 'Establish repository structure, select frameworks, draft API endpoints, and define exact schemas.',
        tasks: ['Initialize clean Git repository', 'Create basic workspace outline', 'Write design doc outlining core endpoints'],
        completed: false,
        type: 'fundamentals' as const
      },
      {
        id: 'step-2',
        title: 'UI Design & Frontend Shell Implementation',
        duration: 'Days 3-6',
        description: 'Build core application pages, setup styling tokens, configure responsive grids, and design key page cards.',
        tasks: ['Build global responsive navbar', 'Draft layout shells with skeleton loaders', 'Integrate Tailwind variables for themes'],
        completed: false,
        type: 'frontend' as const
      },
      {
        id: 'step-3',
        title: 'Core Backend Logics & DB Integration',
        duration: 'Days 7-12',
        description: 'Establish database connections, build backend api pipelines, run queries, and setup schemas.',
        tasks: ['Create basic backend models', 'Verify database connections', 'Test controllers with robust error handlers'],
        completed: false,
        type: 'backend' as const
      },
      {
        id: 'step-4',
        title: 'API Integrations & Custom Features',
        duration: 'Days 13-16',
        description: 'Integrate external AI model endpoints, webhook handlers, and other special feature engines.',
        tasks: ['Integrate OpenAI/anthropic API calls', 'Build webhook routes for payments or git hooks', 'Connect storage servers (S3/Cloudinary)'],
        completed: false,
        type: 'integration' as const
      },
      {
        id: 'step-5',
        title: 'Deployments & Recruiter Handshakes',
        duration: 'Days 17-20',
        description: 'Launch application to production, set SSL configs, run unit tests, and prepare markdown portfolios.',
        tasks: ['Deploy to Vercel/Railway', 'Run lighthouse tests and optimize assets', 'Create detailed README.md for recruiter eyes'],
        completed: false,
        type: 'deployment' as const
      }
    ];

    const projectData = state.projects.find(p => p.id === projectId);
    if (projectData) {
      saveProjectToDb({
        id: projectId,
        title: projectData.title,
        description: projectData.description || undefined,
        status: 'Planned',
        progress: 0,
        tags: projectData.technologies,
        roadmap: newSteps
      });
      createActivityInDb(projectId, `Initialized Blueprint: ${title}`, 'project_start');
    }

    const newActivity: ProjectActivity = {
      id: `local-${Date.now()}-${projectId}`,
      type: 'project_start',
      description: `Initialized Blueprint: ${title}`,
      projectId,
      projectTitle: title,
      createdAt: new Date().toISOString(),
    };

    return {
      activities: [newActivity, ...state.activities],
      roadmaps: {
        ...state.roadmaps,
        [projectId]: {
          projectId,
          projectTitle: title,
          steps: newSteps
        }
      }
    };
  }),

  // Chat State
  conversations: INITIAL_CONVERSATIONS,
  activeConversationId: 'conv-1',
  isRoastMode: false,
  toggleRoastMode: () => set((state) => ({ isRoastMode: !state.isRoastMode })),
  sendMessage: (content, codeSnippet, attachments) => set((state) => {
    const activeId = state.activeConversationId;
    if (!activeId) return {};

    const newMessage: ChatMessage = {
      id: 'msg-usr-' + Math.random().toString(36).substr(2, 9),
      role: 'user',
      content,
      timestamp: new Date(),
      codeSnippet,
      attachments
    };

    // Update active conversation
    const updatedConversations = state.conversations.map((conv) => {
      if (conv.id === activeId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastUpdated: new Date()
        };
      }
      return conv;
    });

    // Prepare an empty AI message to stream into
    const aiMessageId = 'msg-ai-' + Math.random().toString(36).substr(2, 9);
    const initialAiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    const updatedConversationsWithAi = updatedConversations.map((conv) => {
      if (conv.id === activeId) {
        return {
          ...conv,
          messages: [...conv.messages, initialAiMessage]
        };
      }
      return conv;
    });

    // Start streaming async
    (async () => {
      try {
        const activeConv = get().conversations.find((c) => c.id === activeId);
        if (!activeConv) return;
        
        const apiMessages = [...activeConv.messages, newMessage].map(m => ({ role: m.role, content: m.content }));
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            userContext: get().user || DEFAULT_USER,
            isRoastMode: get().isRoastMode
          })
        });

        if (!response.ok || !response.body) throw new Error('Failed to fetch AI response');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          aiContent += chunk;
          
          set((s) => ({
            conversations: s.conversations.map((c) => {
              if (c.id === activeId) {
                return {
                  ...c,
                  messages: c.messages.map(m => m.id === aiMessageId ? { ...m, content: aiContent } : m),
                  lastUpdated: new Date()
                };
              }
              return c;
            })
          }));
        }
      } catch (error) {
        console.error('AI Streaming Error:', error);
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id === activeId) {
              return {
                ...c,
                messages: c.messages.map(m => m.id === aiMessageId ? { ...m, content: 'Sorry, I encountered an error. Please check your API key and try again.' } : m)
              };
            }
            return c;
          })
        }));
      }
    })();

    return {
      conversations: updatedConversationsWithAi
    };
  }),
  createNewConversation: (title) => {
    const newId = 'conv-' + Math.random().toString(36).substr(2, 9);
    const newConv: ChatConversation = {
      id: newId,
      title: title || 'New Mentor Guidance Session',
      messages: [
        {
          id: 'msg-init-' + Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: 'Hello! I am your AI Career Mentor. Ask me anything about your recommended projects, how to fill skill gaps, structuring your github portfolio, or preparing for interviews with recruiters!',
          timestamp: new Date()
        }
      ],
      lastUpdated: new Date()
    };

    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: newId
    }));

    return newId;
  },
  selectConversation: (id) => set({ activeConversationId: id }),
  deleteConversation: (id) => set((state) => {
    const updated = state.conversations.filter((c) => c.id !== id);
    const active = state.activeConversationId === id 
      ? (updated.length > 0 ? updated[0].id : null)
      : state.activeConversationId;
    return {
      conversations: updated,
      activeConversationId: active
    };
  }),

  // GitHub Analytics State
  githubAnalytics: MOCK_GITHUB,
  connectGithub: async (username) => {
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=updated`);
      if (!res.ok) throw new Error('Failed to fetch repositories');
      const repos = await res.json();
      
      if (!Array.isArray(repos)) throw new Error('Invalid response from GitHub API');
      
      const langCounts: Record<string, number> = {};
      repos.forEach(r => {
        if (r.language) {
          langCounts[r.language] = (langCounts[r.language] || 0) + 1;
        }
      });
      
      const colors: Record<string, string> = {
        TypeScript: '#3178c6',
        JavaScript: '#f1e05a',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Python: '#3572A5',
        Java: '#b07219',
        Go: '#00ADD8',
        Rust: '#dea584',
        C: '#555555',
        'C++': '#f34b7d',
        Ruby: '#701516',
        PHP: '#4F5D95',
        Shell: '#89e051'
      };
      
      const totalLangs = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
      const languages = Object.entries(langCounts).map(([name, count]) => ({
        name,
        value: Math.round((count / totalLangs) * 100),
        color: colors[name] || '#8b5cf6'
      })).sort((a, b) => b.value - a.value);
      
      const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
      const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
      
      const portfolioStrengthScore = Math.min(98, 50 + repos.length * 2 + totalStars * 3);
      const consistencyScore = Math.min(95, 60 + (repos.length % 5) * 8);
      const aiEngineerReadiness = Math.min(95, 40 + (langCounts['Python'] || 0) * 12 + (langCounts['TypeScript'] || 0) * 6);
      
      const skillDetection = [
        ...new Set([
          ...Object.keys(langCounts).map(l => `${l} Development`),
          'UI Architecture',
          'API Infrastructure',
          'Modern Git Workflows'
        ])
      ].slice(0, 6);
      
      const recruiterInsights = [
        `Demonstrates strong capabilities in ${Object.keys(langCounts).slice(0, 3).join(', ') || 'coding'} through public repositories.`,
        `Active GitHub profile @${username} with ${repos.length} public repositories and ${totalStars} stars recorded.`,
        `Primary stack focus lies in ${languages[0]?.name || 'Fullstack'} systems with secondary exposure in ${languages[1]?.name || 'web'} development.`
      ];
      
      const growthRecommendations = [
        `Increase unit test coverage in your primary ${languages[0]?.name || 'TypeScript'} repositories.`,
        `Configure GitHub Actions CI pipeline for automated testing on active pushes.`,
        `Improve README.md documentation for ${repos[0]?.name || 'your projects'} to showcase system design patterns.`
      ];
      
      const repositoryIntelligence = repos.map((r: any) => ({
        name: r.name,
        description: r.description || 'Public GitHub repository.',
        analysis: [
          r.description ? 'Descriptive repository metadata' : 'Clean code container',
          `Main language detected as ${r.language || 'Plain text'}`,
          r.fork ? 'Forked open-source repository' : 'Original pilot blueprint development',
          `Last active update: ${new Date(r.updated_at).toLocaleDateString()}`
        ],
        detectedSkills: [r.language || 'General Stack', 'Code Architecture', r.fork ? 'Collaboration' : 'Independent Project'],
        growthRecommendation: [
          `Add more tests to verify ${r.language || 'codebase'} coverage`,
          'Document configuration setups in README.md'
        ],
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        lang: r.language || 'Unknown'
      }));
      
      set((state) => ({
        githubAnalytics: {
          username,
          avatarUrl: repos[0]?.owner?.avatar_url || state.githubAnalytics.avatarUrl,
          totalRepos: repos.length,
          totalCommits: repos.length * 15 + totalStars * 2, // simulated commits count
          consistencyScore,
          portfolioStrengthScore,
          aiEngineerReadiness,
          connected: true,
          languages,
          recentCommits: state.githubAnalytics.recentCommits,
          skillDetection,
          growthRecommendations,
          recruiterInsights,
          repositoryIntelligence
        }
      }));
    } catch (e) {
      console.error('GitHub API failed, falling back to mock metrics:', e);
      set((state) => ({
        githubAnalytics: {
          ...state.githubAnalytics,
          username,
          connected: true
        }
      }));
    }
  },
  disconnectGithub: () => set((state) => ({
    githubAnalytics: {
      ...state.githubAnalytics,
      username: '',
      connected: false
    }
  })),

  // Career Score State
  careerScore: MOCK_CAREER,
  recalculateCareerScore: () => set((state) => {
    // Simply increment score on action or keep constant for representation
    const newScore = Math.min(100, state.careerScore.overallScore + 2);
    return {
      careerScore: {
        ...state.careerScore,
        overallScore: newScore
      }
    };
  })
}));
