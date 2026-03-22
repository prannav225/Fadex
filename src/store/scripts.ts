import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/uuid";

export interface Script {
  id: string;
  title: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

interface ScriptsState {
  scripts: Script[];
  addScript: (title: string) => string; // Changed return type
  renameScript: (id: string, newTitle: string) => void;
  deleteScript: (id: string) => void;
  touchScript: (id: string) => void;
}

export const useScriptsStore = create<ScriptsState>()(
  persist(
    (set) => ({
      scripts: [],
      addScript: (title) => {
        const id = generateId(); // Replaced crypto.randomUUID()
        const newScript: Script = {
          id,
          title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({ scripts: [newScript, ...state.scripts] }));
        return id; // Added return value
      },
      renameScript: (id, newTitle) =>
        set((state) => ({
          scripts: state.scripts.map((script) =>
            script.id === id
              ? {
                  ...script,
                  title: newTitle,
                  updated_at: new Date().toISOString(),
                }
              : script,
          ),
        })),
      deleteScript: (id) =>
        set((state) => ({
          scripts: state.scripts.filter((script) => script.id !== id),
        })),
      touchScript: (id) =>
        set((state) => ({
          scripts: state.scripts.map((script) =>
            script.id === id
              ? {
                  ...script,
                  updated_at: new Date().toISOString(),
                }
              : script,
          ),
        })),
    }),
    {
      name: "screenplay-scripts-storage",
    },
  ),
);
