import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ToolConfig } from '@/config/tools';
import {
  saveToolData,
  loadToolData,
  clearToolData,
  type ToolData,
} from './toolDB';

const toolIndexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    const data = await loadToolData();
    return data ? JSON.stringify(data) : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    const data = JSON.parse(value) as ToolData;
    await saveToolData(data);
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    await clearToolData();
  },
};

export interface ToolUsageMetric {
  count: number;
  lastUsedTimestamp: number;
}

interface ToolStore {
  favorites: string[];
  usageMetrics: Record<string, ToolUsageMetric>;
  currentTool: ToolConfig | null;
  currentToolSlug: string | null;

  toggleFavorite: (toolSlug: string) => void;
  incrementUsage: (toolSlug: string) => void;
  setCurrentTool: (tool: ToolConfig | null) => void;
  reset: () => void;
}

export const useToolStore = create<ToolStore>()(
  persist(
    (set) => ({
      favorites: [],
      usageMetrics: {},
      currentTool: null,
      currentToolSlug: null,

      toggleFavorite: (toolSlug: string) =>
        set((state) => {
          const nextFavorites = state.favorites.includes(toolSlug)
            ? state.favorites.filter((slug) => slug !== toolSlug)
            : [...state.favorites, toolSlug];
          return { favorites: nextFavorites };
        }),

      incrementUsage: (toolSlug: string) =>
        set((state) => {
          const existingMetric = state.usageMetrics[toolSlug] || { count: 0, lastUsedTimestamp: 0 };
          return {
            usageMetrics: {
              ...state.usageMetrics,
              [toolSlug]: {
                count: existingMetric.count + 1,
                lastUsedTimestamp: Date.now(),
              },
            },
          };
        }),

      setCurrentTool: (tool: ToolConfig | null) =>
        set({
          currentTool: tool,
          currentToolSlug: tool?.slug || null,
        }),

      reset: () =>
        set({
          favorites: [],
          usageMetrics: {},
          currentTool: null,
          currentToolSlug: null,
        }),
    }),
    {
      name: 'tool-storage',
      storage: createJSONStorage(() => toolIndexedDBStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        usageMetrics: state.usageMetrics,
        currentToolSlug: state.currentToolSlug,
      }),
    }
  )
);