import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { saveToolData, loadToolData, clearToolData, type ToolData } from '@/core/services/toolDB';

const toolIndexedDBStorage = {
  getItem: async (): Promise<string | null> => {
    const data = await loadToolData();
    return data ? JSON.stringify(data) : null;
  },
  setItem: async (_name: string, value: string): Promise<void> => {
    const data = JSON.parse(value) as ToolData;
    await saveToolData(data);
  },
  removeItem: async (): Promise<void> => {
    await clearToolData();
  },
};

interface ToolStore {
  favorites: string[];
  usageCounts: Record<string, number>;
  currentToolId: string | null;
  toggleFavorite: (toolId: string) => void;
  incrementUsage: (toolId: string) => void;
  setCurrentToolId: (id: string | null) => void;
}

export const useToolStore = create<ToolStore>()(
  persist(
    (set) => ({
      favorites: [],
      usageCounts: {},
      currentToolId: null,
      toggleFavorite: (toolId: string) =>
        set((state) => ({
          favorites: state.favorites.includes(toolId)
            ? state.favorites.filter((id) => id !== toolId)
            : [...state.favorites, toolId],
        })),
      incrementUsage: (toolId: string) =>
        set((state) => ({
          usageCounts: {
            ...state.usageCounts,
            [toolId]: (state.usageCounts[toolId] || 0) + 1,
          },
        })),
      setCurrentToolId: (id) => set({ currentToolId: id }),
    }),
    {
      name: 'toolkit-storage',
      storage: createJSONStorage(() => toolIndexedDBStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        usageCounts: state.usageCounts,
        currentToolId: state.currentToolId,
      }),
    }
  )
);