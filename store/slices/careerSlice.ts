import { StateCreator } from "zustand";
import { CareerScore } from "@/types";

export interface CareerSlice {
  careerScore: CareerScore;

  recalculateCareerScore: () => void;
}

export const createCareerSlice =
  (MOCK_CAREER: CareerScore): StateCreator<CareerSlice, [], [], CareerSlice> =>
  (set) => ({
    careerScore: MOCK_CAREER,

    recalculateCareerScore: () =>
      set((state) => {
        const newScore = Math.min(
          100,
          state.careerScore.overallScore + 2
        );

        return {
          careerScore: {
            ...state.careerScore,
            overallScore: newScore,
          },
        };
      }),
  });