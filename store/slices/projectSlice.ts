import { StateCreator } from "zustand";
import { Project, ProjectActivity, Roadmap } from "@/types";
import {
  toggleProjectMilestoneInDb,
  createActivityInDb,
  saveProjectToDb,
} from "@/app/actions/projectActions";
import { toast } from "sonner";

export interface ProjectSlice {
  projects: Project[];
  selectedProjectId: string | null;

  activities: ProjectActivity[];
  roadmaps: Record<string, Roadmap>;

  setProjects: (projects: Project[]) => void;
  selectProject: (id: string | null) => void;
  addCustomProject: (project: Project) => void;

  setActivities: (activities: ProjectActivity[]) => void;

  toggleStepCompletion: (projectId: string, stepId: string) => void;
  toggleTaskCompletion: (
    projectId: string,
    stepId: string,
    taskIndex: number
  ) => void;

  initializeRoadmap: (projectId: string, title: string) => void;
}

export const createProjectSlice = (
  MOCK_PROJECTS: Project[],
  INITIAL_ROADMAPS: Record<string, Roadmap>
): StateCreator<any, [], [], ProjectSlice> => (set, get) => ({
  projects: MOCK_PROJECTS,

  selectedProjectId: "project-1",

  setProjects: (projects) => set({ projects }),

  selectProject: (id) => set({ selectedProjectId: id }),

  addCustomProject: (newProject) =>
    set((state) => {
      const updatedProjects = [newProject, ...state.projects];

      saveProjectToDb({
        id: newProject.id,
        title: newProject.title,
        description: newProject.description || undefined,
        status: newProject.status || "Planned",
        progress: newProject.progress || 0,
        tags: newProject.technologies || [],
      });

      createActivityInDb(
        newProject.id,
        `Created project: ${newProject.title}`,
        "project_created"
      );

      const newActivity: ProjectActivity = {
        id: `activity-${Date.now()}`,
        type: "project_created",
        description: `Created project: ${newProject.title}`,
        projectId: newProject.id,
        projectTitle: newProject.title,
        createdAt: new Date().toISOString(),
      };

      return {
        projects: updatedProjects,
        selectedProjectId: newProject.id,
        activities: [newActivity, ...state.activities],
      };
    }),

  activities: [],

  setActivities: (activities) => set({ activities }),

  roadmaps: INITIAL_ROADMAPS,

  toggleStepCompletion: (projectId, stepId) => {
    let isCompleted = false;
    let stepTitle = "";

    set((state: any) => {
      const roadmap = state.roadmaps[projectId];
      if (!roadmap) return {};

      const updatedSteps = roadmap.steps.map((step: any) => {
        if (step.id === stepId) {
          isCompleted = !step.completed;
          stepTitle = step.title;

          return {
            ...step,
            completed: isCompleted,
          };
        }

        return step;
      });

      const completedCount = updatedSteps.filter((s: any) => s.completed).length;
      const progress = Math.round(
        (completedCount / updatedSteps.length) * 100
      );

      toggleProjectMilestoneInDb(
        projectId,
        stepId,
        updatedSteps,
        progress
      );

      const projectTitle = state.projects.find(
        (project: any) => project.id === projectId
      )?.title;

      const newActivity: ProjectActivity | null = isCompleted
        ? {
            id: `local-${Date.now()}-${stepId}`,
            type: "milestone",
            description: `Completed milestone: ${stepTitle}`,
            projectId,
            projectTitle,
            createdAt: new Date().toISOString(),
          }
        : null;

      if (isCompleted) {
        createActivityInDb(
          projectId,
          `Completed milestone: ${stepTitle}`,
          "milestone"
        );
      }

      return {
        roadmaps: {
          ...state.roadmaps,
          [projectId]: {
            ...roadmap,
            steps: updatedSteps,
          },
        },

        activities: newActivity
          ? [newActivity, ...state.activities]
          : state.activities,

        projects: state.projects.map((p: any) =>
          p.id === projectId
            ? {
                ...p,
                progress,
                status:
                  progress === 100
                    ? "Completed"
                    : "In Progress",
              }
            : p
        ),
      };
    });

    if (isCompleted && stepTitle) {
      toast.success(`Milestone completed: ${stepTitle}! (+2 Career Score)`);
      const store = get() as any;
      if (store && typeof store.recalculateCareerScore === "function") {
        store.recalculateCareerScore();
      }
    }
  },

  toggleTaskCompletion: () => set(() => ({})),

  initializeRoadmap: (projectId, title) =>
    set((state) => {
      if (state.roadmaps[projectId]) return {};

      const newSteps = [
        {
          id: "step-1",
          title: "Project Inception & Architecture Planning",
          duration: "Days 1-2",
          description:
            "Establish repository structure, select frameworks,draft API endpoints, and define exact schemas.",
          tasks: [
            "Initialize clean Git repository",
            "Create basic workspace outline",
            "Write design doc outlining core endpoints",
          ],
          completed: false,
          type: "fundamentals" as const,
        },
        {
          id: "step-2",
          title: "UI Design & Frontend Shell Implementation",
          duration: "Days 3-6",
          description:
            "Build core application pages, setup styling tokens, configure responsive grids, and design key page cards.",
          tasks: [
            "Build global responsive navbar",
            "Draft layout shells with skeleton loaders",
            "Integrate Tailwind variables for themes",
          ],
          completed: false,
          type: "frontend" as const,
        },
        {
          id: "step-3",
          title: "Core Backend Logics & DB Integration",
          duration: "Days 7-12",
          description:
            "Establish database connections, build backend api pipelines, run queries, and setup schemas.",
          tasks: [
            "Create basic backend models",
            "Verify database connections",
            "Test controllers with robust error handlers",
          ],
          completed: false,
          type: "backend" as const,
        },
        {
          id: "step-4",
          title: "API Integrations & Custom Features",
          duration: "Days 13-16",
          description:
            "Integrate external AI model endpoints, webhook handlers, and other special feature engines.",
          tasks: [
            "Integrate OpenAI/anthropic API calls",
            "Build webhook routes for payments or git hooks",
            "Connect storage servers (S3/Cloudinary)",
          ],
          completed: false,
          type: "integration" as const,
        },
        {
          id: "step-5",
          title: "Deployments & Recruiter Handshakes",
          duration: "Days 17-20",
          description:
            "Launch application to production, set SSL configs,run unit tests, and prepare markdown portfolios.",
          tasks: [
            "Deploy to Vercel/Railway",
            "Run lighthouse tests and optimize assets",
            "Create detailed README.md for recruiter eyes",
          ],
          completed: false,
          type: "deployment" as const,
        },
      ];

      const projectData = state.projects.find((p) => p.id === projectId);

      if (projectData) {
        saveProjectToDb({
          id: projectId,
          title: projectData.title,
          description: projectData.description || undefined,
          status: "Planned",
          progress: 0,
          tags: projectData.technologies,
          roadmap: newSteps,
        });

        createActivityInDb(
          projectId,
          `Initialized Blueprint: ${title}`,
          "project_start"
        );
      }

      const newActivity: ProjectActivity = {
        id: `local-${Date.now()}-${projectId}`,
        type: "project_start",
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
            steps: newSteps,
          },
        },
      };
    }),
});