import { useEffect, useCallback } from "react";
import { ScreenplayBlock, getTabNextBlockType, BlockType } from "@/lib/editor-types";

interface UseEditorEventsProps {
  scriptId: string;
  activeBlockId: string | null;
  blocks: ScreenplayBlock[];
  addBlock: (scriptId: string, index: number) => string;
  deleteBlock: (scriptId: string, id: string) => void;
  changeBlockType: (scriptId: string, id: string, type: BlockType) => void;
  cycleBlockType: (scriptId: string, id: string, reverse: boolean) => void;
  undo: (scriptId: string) => void;
  redo: (scriptId: string) => void;
  setActiveBlockId: (id: string | null) => void;
}

export function useEditorEvents({
  scriptId,
  activeBlockId,
  blocks,
  addBlock,
  deleteBlock,
  changeBlockType,
  cycleBlockType,
  undo,
  redo,
  setActiveBlockId,
}: UseEditorEventsProps) {
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>, id: string, index: number) => {
    const textarea = e.currentTarget;
    const content = textarea.value;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newBlockId = addBlock(scriptId, index);
      requestAnimationFrame(() => setActiveBlockId(newBlockId));
    } else if (e.key === "Backspace" && content === "" && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(scriptId, id);
      if (index > 0) setActiveBlockId(blocks[index - 1].id);
    } else if (e.key === "ArrowUp" && textarea.selectionStart === 0 && index > 0) {
      e.preventDefault();
      setActiveBlockId(blocks[index - 1].id);
    } else if (e.key === "ArrowDown" && textarea.selectionEnd === content.length && index < blocks.length - 1) {
      e.preventDefault();
      setActiveBlockId(blocks[index + 1].id);
    }
  }, [scriptId, blocks, addBlock, deleteBlock, setActiveBlockId]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(scriptId);
        else undo(scriptId);
      }

      // Tab Key - Professional Transformation
      if (e.key === "Tab") {
        e.preventDefault();
        if (!activeBlockId) return;

        const index = blocks.findIndex(b => b.id === activeBlockId);
        if (index === -1) return;

        if (e.shiftKey) {
          cycleBlockType(scriptId, activeBlockId, true);
        } else {
          const currentBlock = blocks[index];
          const previousBlock = index > 0 ? blocks[index - 1] : null;
          const nextType = getTabNextBlockType(currentBlock?.type || "action", previousBlock?.type);
          changeBlockType(scriptId, activeBlockId, nextType);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [scriptId, undo, redo, activeBlockId, blocks, cycleBlockType, changeBlockType]);

  return { handleKeyDown };
}
