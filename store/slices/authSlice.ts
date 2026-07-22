import { StateCreator } from "zustand";
import { User } from "@/types";
import { generateAdaptiveDashboard } from "@/lib/adaptiveEngine";

export interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;

  login: (email: string, name: string) => void;
  signup: (
    email: string,
    name: string,
    careerGoal: string
  ) => void;
  logout: () => void;

  updateProfile: (
    name: string,
    email: string,
    careerGoal: string
  ) => void;

  updateAvatar: (avatarUrl: string) => void;

  updateProfessionalLinks: (
    githubUrl: string,
    linkedinUrl: string,
    resumeUrl: string
  ) => void;

  updateUserSkills: (skills: string[]) => void;

  updatePortfolioVisibility: (
    portfolioPublic: boolean,
    username?: string
  ) => void;

  syncUserProfile: (dbUser: any) => void;
}

const DEFAULT_USER: User = {
  id: "user-yogender",
  name: "Yogender Verma",
  username: "yogender-verma",
  email: "yogendarverma0268@gmail.com",
  avatarUrl:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
  careerGoal: "AI Engineer",
  skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  portfolioPublic: false,
  githubUrl: "",
  linkedinUrl: "",
  resumeUrl: "",
};
export const createAuthSlice: StateCreator<
  any,
  [],
  [],
  AuthSlice
> = (set, get) => ({
  user: DEFAULT_USER,

  isAuthenticated: true,
    login: (email, name) => {
    const newUser = {
      id: "user-" + Math.random().toString(36).substr(2, 9),
      name: name || email?.split("@")[0] || "User",
      email: email || "",
      avatarUrl: "",
      careerGoal: "fullstack",
      githubUrl: "",
      linkedinUrl: "",
      resumeUrl: "",
      skills: [],
    };

    const adaptive = generateAdaptiveDashboard(newUser);

    set((state: any) => ({
      isAuthenticated: true,
      user: newUser,
      careerScore: adaptive.careerScore,
      projects: adaptive.projects,
      githubAnalytics: {
        ...state.githubAnalytics,
        recruiterInsights: adaptive.insights,
      },
    }));
  },

  signup: (email, name, careerGoal) => {
    const newUser = {
      id: "user-" + Math.random().toString(36).substr(2, 9),
      name: name || email?.split("@")[0] || "User",
      email: email || "",
      avatarUrl: "",
      careerGoal: careerGoal || "fullstack",
      githubUrl: "",
      linkedinUrl: "",
      resumeUrl: "",
      skills: [],
    };

    const adaptive = generateAdaptiveDashboard(newUser);

    set((state: any) => ({
      isAuthenticated: true,
      user: newUser,
      careerScore: adaptive.careerScore,
      projects: adaptive.projects,
      githubAnalytics: {
        ...state.githubAnalytics,
        recruiterInsights: adaptive.insights,
      },
    }));
  },
    logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  updateProfile: (name, email, careerGoal) =>
    set((state: any) => {
      if (!state.user) return {};

      const updatedUser = {
        ...state.user,
        name,
        email,
        careerGoal,
      };

      const adaptive = generateAdaptiveDashboard(updatedUser);

      return {
        user: updatedUser,
        careerScore: adaptive.careerScore,
        projects: adaptive.projects,
        githubAnalytics: {
          ...state.githubAnalytics,
          recruiterInsights: adaptive.insights,
        },
      };
    }),

  updateAvatar: (avatarUrl) =>
    set((state: any) => {
      if (!state.user) return {};

      const updatedUser = {
        ...state.user,
        avatarUrl,
      };

      const adaptive = generateAdaptiveDashboard(updatedUser);

      return {
        user: updatedUser,
        careerScore: adaptive.careerScore,
        projects: adaptive.projects,
        githubAnalytics: {
          ...state.githubAnalytics,
          recruiterInsights: adaptive.insights,
        },
      };
    }),

  updateProfessionalLinks: (
    githubUrl,
    linkedinUrl,
    resumeUrl
  ) =>
    set((state: any) => {
      if (!state.user) return {};

      return {
        user: {
          ...state.user,
          githubUrl,
          linkedinUrl,
          resumeUrl,
        },
      };
    }),

  updateUserSkills: (skills) =>
    set((state: any) => {
      if (!state.user) return {};

      const updatedUser = {
        ...state.user,
        skills,
      };

      const adaptive = generateAdaptiveDashboard(updatedUser);

      return {
        user: updatedUser,
        careerScore: adaptive.careerScore,
        projects: adaptive.projects,
        githubAnalytics: {
          ...state.githubAnalytics,
          recruiterInsights: adaptive.insights,
        },
      };
    }),

  updatePortfolioVisibility: (portfolioPublic, username) =>
    set((state: any) => {
      if (!state.user) return {};

      return {
        user: {
          ...state.user,
          portfolioPublic,
          ...(username ? { username } : {}),
        },
      };
    }),

  syncUserProfile: (dbUser) => {
    if (!dbUser) return;

    set((state: any) => {
      const updatedUser = {
        id: dbUser.clerkId || dbUser.id || "",
        name:
          dbUser.fullName ||
          dbUser.email?.split("@")[0] ||
          "Anonymous User",
        username:
          dbUser.username ||
          dbUser.fullName?.toLowerCase().replace(/\s+/g, "-") ||
          "yogender-verma",
        email: dbUser.email || "",
        avatarUrl: dbUser.imageUrl || "",
        careerGoal: dbUser.dreamRole || "fullstack",
        skills: dbUser.skills || [],
        portfolioPublic: dbUser.portfolioPublic ?? false,
        githubUrl: dbUser.githubUrl || "",
        linkedinUrl: dbUser.linkedinUrl || "",
        resumeUrl: dbUser.resumeUrl || "",
      };

      const adaptive = generateAdaptiveDashboard(updatedUser);

      const dbProjects = dbUser.projects || [];
      const adaptiveProjects = adaptive.projects;

      const mergedProjects = adaptiveProjects.map((ap: any) => {
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

      const dbActivities = dbProjects
        .flatMap((dp: any) =>
          (dp.activities || []).map((activity: any) => ({
            id: activity.id,
            type: activity.type,
            description: activity.description,
            projectId: activity.projectId,
            projectTitle: dp.title,
            createdAt: new Date(activity.createdAt).toISOString(),
          }))
        )
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      const updatedRoadmaps = { ...state.roadmaps };

      dbProjects.forEach((dp: any) => {
        if (!dp.roadmap) return;

        try {
          const steps =
            typeof dp.roadmap === "string"
              ? JSON.parse(dp.roadmap)
              : dp.roadmap;

          updatedRoadmaps[dp.id] = {
            projectId: dp.id,
            projectTitle: dp.title,
            steps,
          };
        } catch (e) {
          console.error(
            "Failed to parse database project roadmap:",
            e
          );
        }
      });

      return {
        isAuthenticated: true,
        user: updatedUser,
        careerScore: adaptive.careerScore,
        projects: mergedProjects,
        roadmaps: updatedRoadmaps,
        activities: dbActivities,
        githubAnalytics: {
          ...state.githubAnalytics,
          recruiterInsights: adaptive.insights,
        },
      };
    });
  },
  });
