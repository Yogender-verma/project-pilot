import { StateCreator } from "zustand";
import { OnboardingData } from "@/types";

export interface OnboardingSlice {
  onboardingData: OnboardingData;
  onboardingStep: number;

  setOnboardingField: <K extends keyof OnboardingData>(
    field: K,
    value: OnboardingData[K]
  ) => void;

  setOnboardingStep: (step: number) => void;

  resetOnboarding: () => void;
}

const initialOnboarding: OnboardingData = {
  fullName: "",
  email: "",
  experienceLevel: "intermediate",
  dreamRole: "AI Engineer",
  skills: [],
  resumeFile: null,
  resumeName: null,
  githubUrl: "",
  linkedinUrl: "",
  availableHoursPerWeek: 15,
};

export const createOnboardingSlice: StateCreator<
  OnboardingSlice,
  [],
  [],
  OnboardingSlice
> = (set) => ({
  onboardingData: initialOnboarding,

  onboardingStep: 1,

  setOnboardingField: (field, value) =>
    set((state) => ({
      onboardingData: {
        ...state.onboardingData,
        [field]: value,
      },
    })),

  setOnboardingStep: (step) =>
    set({
      onboardingStep: step,
    }),

  resetOnboarding: () =>
    set({
      onboardingStep: 1,
      onboardingData: initialOnboarding,
    }),
});