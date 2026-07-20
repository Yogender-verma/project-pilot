export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  careerGoal?: string;

  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;

  skills: string[];
}

export interface OnboardingData {
  fullName: string;
  email: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  dreamRole: string;
  skills: string[];
  resumeFile: string | null; // Base64 or name
  resumeName: string | null;
  githubUrl: string;
  linkedinUrl: string;
  availableHoursPerWeek: number;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  resumeValue: number; // 0-100 score
  careerImpact: string;
  skillsGained: string[];
  technologies: string[];
  recommendationReason: string;
  features: string[];
  recommendedApis: string[];
  toolsRequired: string[];
  completionTime: string;
  githubPortfolioValue: string;
  category: string;
  status?: string;
  progress?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  githubUrl?: string;
  liveUrl?: string;
}

export type ProjectActivityType =
  | 'project_created'
  | 'project_updated'
  | 'status_changed'
  | 'progress_updated'
  | 'milestone'
  | 'project_start'
  | 'archived'
  | 'restored';

export interface ProjectActivity {
  id: string;
  type: ProjectActivityType | string;
  description: string;
  projectId: string;
  projectTitle?: string;
  createdAt: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  duration: string;
  description: string;
  tasks: string[];
  completed: boolean;
  type: 'fundamentals' | 'frontend' | 'backend' | 'integration' | 'deployment';
}

export interface Roadmap {
  projectId: string;
  projectTitle: string;
  steps: RoadmapStep[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: { name: string; size: string; type: string }[];
  codeSnippet?: { language: string; code: string };
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: Date;
}

export interface CommitActivity {
  day: string;
  commits: number;
}

export interface LanguageBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface RepositoryIntelligence {
  name: string;
  description: string;
  analysis: string[];
  detectedSkills: string[];
  growthRecommendation: string[];
  stars: number;
  forks: number;
  lang: string;
}

export interface GitHubAnalytics {
  username: string;
  avatarUrl: string;
  totalRepos: number;
  totalCommits: number;
  consistencyScore: number; // 0-100
  portfolioStrengthScore: number;
  aiEngineerReadiness: number;
  languages: LanguageBreakdown[];
  recentCommits: CommitActivity[];
  recruiterInsights: string[];
  skillDetection: string[];
  growthRecommendations: string[];
  repositoryIntelligence: RepositoryIntelligence[];
  connected: boolean;
}

export interface CareerScore {
  overallScore: number;
  frontendReadiness: number;
  backendReadiness: number;
  devOpsReadiness: number;
  missingSkills: { name: string; importance: 'High' | 'Medium' | 'Low'; category: string }[];
  improvements: string[];
  resumeScore: number;
}


export type NotificationType =
  | 'deadline_approaching'
  | 'deadline_missed'
  | 'project_stalled'
  | 'milestone_completed'
  | 'project_completed'
  | 'career_milestone_due';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string | null;
  projectId?: string | null;
  createdAt: string;
}
