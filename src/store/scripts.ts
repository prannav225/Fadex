import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/uuid";

export interface Script {
  id: string;
  title: string;
  author?: string;
  based_on?: string;
  contact_info?: string;
  logline?: string;
  genre?: string;
  status?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

interface ScriptsState {
  scripts: Script[];
  addScript: (title: string) => string;
  renameScript: (id: string, newTitle: string) => void;
  updateScriptMetadata: (id: string, metadata: Partial<Script>) => void;
  deleteScript: (id: string) => void;
  touchScript: (id: string) => void;
}

export const useScriptsStore = create<ScriptsState>()(
  persist(
    (set) => ({
      scripts: [],
      addScript: (title) => {
        const id = generateId();
        const newScript: Script = {
          id,
          title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: "First Draft", // Default status
        };
        set((state) => ({ scripts: [newScript, ...state.scripts] }));
        return id;
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
      updateScriptMetadata: (id, metadata) =>
        set((state) => ({
          scripts: state.scripts.map((script) =>
            script.id === id
              ? {
                  ...script,
                  ...metadata,
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
