import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { makeId } from '@/lib/id';

import { makeSampleData } from './seed';
import type { Bean, Brew, Settings } from './types';

export type NewBean = Omit<Bean, 'id' | 'createdAt' | 'isFinished' | 'isFavorite'> &
  Partial<Pick<Bean, 'isFavorite'>>;
export type NewBrew = Omit<Brew, 'id' | 'createdAt'> & Partial<Pick<Brew, 'createdAt'>>;

interface State {
  beans: Bean[];
  brews: Brew[];
  settings: Settings;
  hydrated: boolean;
}

interface Actions {
  addBean: (bean: NewBean) => Bean;
  updateBean: (id: string, patch: Partial<Bean>) => void;
  deleteBean: (id: string) => void;
  addBrew: (brew: NewBrew) => Brew;
  updateBrew: (id: string, patch: Partial<Brew>) => void;
  deleteBrew: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  loadSampleData: () => void;
  eraseAll: () => void;
}

export const DEFAULT_SETTINGS: Settings = {
  grinderName: 'My grinder',
  grindStep: 1,
  finerIsLower: true,
};

export const useStore = create<State & Actions>()(
  persist(
    (set) => ({
      beans: [],
      brews: [],
      settings: DEFAULT_SETTINGS,
      hydrated: false,

      addBean: (input) => {
        const bean: Bean = {
          isFavorite: false,
          ...input,
          id: makeId(),
          isFinished: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ beans: [bean, ...s.beans] }));
        return bean;
      },
      updateBean: (id, patch) =>
        set((s) => ({ beans: s.beans.map((b) => (b.id === id ? { ...b, ...patch, id } : b)) })),
      deleteBean: (id) =>
        set((s) => ({
          beans: s.beans.filter((b) => b.id !== id),
          brews: s.brews.filter((b) => b.beanId !== id),
        })),

      addBrew: (input) => {
        const brew: Brew = { createdAt: new Date().toISOString(), ...input, id: makeId() };
        set((s) => ({ brews: [brew, ...s.brews] }));
        return brew;
      },
      updateBrew: (id, patch) =>
        set((s) => ({ brews: s.brews.map((b) => (b.id === id ? { ...b, ...patch, id } : b)) })),
      deleteBrew: (id) => set((s) => ({ brews: s.brews.filter((b) => b.id !== id) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      loadSampleData: () =>
        set((s) => {
          const sample = makeSampleData();
          return { beans: [...sample.beans, ...s.beans], brews: [...sample.brews, ...s.brews] };
        }),
      eraseAll: () => set({ beans: [], brews: [], settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'dialed:v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ beans, brews, settings }) => ({ beans, brews, settings }),
      onRehydrateStorage: () => () => {
        useStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Look up one bean. Returns a stable reference, so it is safe as a selector. */
export function useBean(id: string | undefined): Bean | undefined {
  return useStore((s) => s.beans.find((b) => b.id === id));
}

export function useBrew(id: string | undefined): Brew | undefined {
  return useStore((s) => s.brews.find((b) => b.id === id));
}
