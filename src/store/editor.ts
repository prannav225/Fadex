import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ScreenplayBlock,
  BlockType,
  getNextBlockType,
  getSmartNextBlockType,
} from "@/lib/editor-types";

interface ScopedEditorState {
  blocks: ScreenplayBlock[];
  past: ScreenplayBlock[][];
  future: ScreenplayBlock[][];
}

interface EditorState {
  scripts: Record<string, ScopedEditorState>;
  initializeScript: (scriptId: string) => void;
  addBlock: (
    scriptId: string,
    index: number,
    content?: string,
    type?: BlockType,
  ) => string;
  updateBlock: (scriptId: string, id: string, content: string) => void;
  changeBlockType: (scriptId: string, id: string, type: BlockType) => void;
  cycleBlockType: (scriptId: string, id: string, reverse: boolean) => void;
  deleteBlock: (scriptId: string, id: string) => void;
  moveBlock: (scriptId: string, draggedId: string, dropId: string) => void;
  undo: (scriptId: string) => void;
  redo: (scriptId: string) => void;
}

const pushHistory = (state: ScopedEditorState) => {
  const newPast = [...(state.past || []), state.blocks];
  if (newPast.length > 50) newPast.shift(); // Limit history
  return { past: newPast, future: [] };
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      scripts: {},

      initializeScript: (scriptId) => {
        const { scripts } = get();
        if (!scripts[scriptId]) {
          set({
            scripts: {
              ...scripts,
              [scriptId]: {
                blocks: [
                  {
                    id: crypto.randomUUID(),
                    type: "transition",
                    content: "FADE IN:",
                  },
                  {
                    id: crypto.randomUUID(),
                    type: "scene_heading",
                    content: "INT. WRITING ROOM - NIGHT",
                  },
                ],
                past: [],
                future: [],
              },
            },
          });
        }
      },

      addBlock: (scriptId, index, content = "", type) => {
        const id = crypto.randomUUID();
        set((state) => {
          const scriptState = state.scripts[scriptId];
          if (!scriptState) return state;

          const currentBlock = scriptState.blocks[index];
          const newType =
            type ||
            (currentBlock
              ? getSmartNextBlockType(currentBlock.type)
              : "action");

          const newBlock: ScreenplayBlock = { id, type: newType, content };
          const newBlocks = [...scriptState.blocks];

          newBlocks.splice(index + 1, 0, newBlock);

          return {
            scripts: {
              ...state.scripts,
              [scriptId]: {
                ...scriptState,
                blocks: newBlocks,
                ...pushHistory(scriptState),
              },
            },
          };
        });
        return id;
      },

      updateBlock: (scriptId, id, content) =>
        set((state) => {
          const scriptState = state.scripts[scriptId];
          if (!scriptState) return state;

          const newBlocks = scriptState.blocks.map((b) =>
            b.id === id ? { ...b, content } : b,
          );

          return {
            scripts: {
              ...state.scripts,
              [scriptId]: { ...scriptState, blocks: newBlocks }, // NO HISTORY PUSH ON TEXT UPDATE TO AVOID SPAM
            },
          };
        }),

      changeBlockType: (scriptId, id, type) =>
        set((state) => {
          const scriptState = state.scripts[scriptId];
          if (!scriptState) return state;

          const newBlocks = scriptState.blocks.map((b) =>
            b.id === id ? { ...b, type } : b,
          );

          return {
            scripts: {
              ...state.scripts,
              [scriptId]: {
                ...scriptState,
                blocks: newBlocks,
                ...pushHistory(scriptState),
              },
            },
          };
        }),

      cycleBlockType: (scriptId, id, reverse) =>
        set((state) => {
          const scriptState = state.scripts[scriptId];
          if (!scriptState) return state;

          const newBlocks = scriptState.blocks.map((b) => {
            if (b.id === id) {
              return { ...b, type: getNextBlockType(b.type, reverse) };
            }
            return b;
          });

          return {
            scripts: {
              ...state.scripts,
              [scriptId]: {
                ...scriptState,
                blocks: newBlocks,
                ...pushHistory(scriptState),
              },
            },
          };
        }),

      deleteBlock: (scriptId, id) =>
        set((state) => {
          const scriptState = state.scripts[scriptId];
          if (!scriptState || scriptState.blocks.length <= 1) return state; // Prevent deleting the last block

          const newBlocks = scriptState.blocks.filter((b) => b.id !== id);

          return {
            scripts: {
              ...state.scripts,
              [scriptId]: {
                ...scriptState,
                blocks: newBlocks,
                ...pushHistory(scriptState),
              },
            },
          };
        }),

      moveBlock: (scriptId, draggedId, dropId) =>
        set((state) => {
          const scriptState = state.scripts[scriptId];
          if (!scriptState) return state;

          if (draggedId === dropId) return state;

          const newBlocks = [...scriptState.blocks];
          const draggedIndex = newBlocks.findIndex((b) => b.id === draggedId);
          const dropIndex = newBlocks.findIndex((b) => b.id === dropId);

          if (draggedIndex === -1 || dropIndex === -1) return state;

          const [draggedItem] = newBlocks.splice(draggedIndex, 1);
          newBlocks.splice(dropIndex, 0, draggedItem);

          return {
            scripts: {
              ...state.scripts,
              [scriptId]: {
                ...scriptState,
                blocks: newBlocks,
                ...pushHistory(scriptState),
              },
            },
          };
        }),

      undo: (scriptId) =>
        set((state) => {
          const scriptState = state.scripts[scriptId];
          if (!scriptState || !scriptState.past?.length) return state;

          const previous = scriptState.past[scriptState.past.length - 1];
          const newPast = scriptState.past.slice(0, -1);
          const newFuture = [scriptState.blocks, ...(scriptState.future || [])];

          return {
            scripts: {
              ...state.scripts,
              [scriptId]: {
                ...scriptState,
                blocks: previous,
                past: newPast,
                future: newFuture,
              },
            },
          };
        }),

      redo: (scriptId) =>
        set((state) => {
          const scriptState = state.scripts[scriptId];
          if (!scriptState || !scriptState.future?.length) return state;

          const next = scriptState.future[0];
          const newFuture = scriptState.future.slice(1);
          const newPast = [...(scriptState.past || []), scriptState.blocks];

          return {
            scripts: {
              ...state.scripts,
              [scriptId]: {
                ...scriptState,
                blocks: next,
                past: newPast,
                future: newFuture,
              },
            },
          };
        }),
    }),
    {
      name: "screenplay-editor-blocks-storage",
    },
  ),
);
