import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setByPath } from '../lib/path';
import type { CV, GapItem, Question } from '../types/cv';

interface Scores {
  atsScore?: number;
  roleFitScore?: number;
  issues?: { path?: string; message: string }[];
  fixHints?: string[];
}

interface State {
  sessionId: string;
  cv: CV | null;
  gaps: GapItem[];
  questions: Question[];
  answers: Record<string, string | number | string[]>;
  scores: Scores;
  setCV: (cv: CV) => void;
  mergeCVPatch: (patch: Partial<CV>) => void;
  setGaps: (g: GapItem[]) => void;
  setQuestions: (q: Question[]) => void;
  setAnswer: (id: string, val: any) => void;
  applyRewrite: (path: string, afterText: string) => void;
  setScores: (s: Scores) => void;
  reset: () => void;
}

export const useSession = create<State>()(
  persist(
    (set, get) => ({
      sessionId: crypto.randomUUID(),
      cv: null,
      gaps: [],
      questions: [],
      answers: {},
      scores: {},
      setCV: (cv) => set({ cv }),
      mergeCVPatch: (patch) => set((state) => ({ cv: { ...(state.cv || {}), ...patch } })),
      setGaps: (g) => set({ gaps: g }),
      setQuestions: (q) => set({ questions: q }),
      setAnswer: (id, val) => set((state) => ({ answers: { ...state.answers, [id]: val } })),
      applyRewrite: (path, afterText) =>
        set((state) => {
          if (!state.cv) return {} as any;
          const cvCopy: any = structuredClone(state.cv);
          setByPath(cvCopy, path, afterText);
          return { cv: cvCopy };
        }),
      setScores: (s) => set({ scores: s }),
      reset: () => set({
        sessionId: crypto.randomUUID(),
        cv: null,
        gaps: [],
        questions: [],
        answers: {},
        scores: {}
      })
    }),
    {
      name: 'cv-session',
      getStorage: () => localStorage
    }
  )
);
