"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/store/editor";
import { EditorBlock } from "./EditorBlock";
import { cn } from "@/lib/utils";
import { Target, List } from "lucide-react";

interface EditorProps {
  scriptId: string;
}

export function Editor({ scriptId }: EditorProps) {
  const {
    scripts,
    initializeScript,
    addBlock,
    updateBlock,
    cycleBlockType,
    deleteBlock,
    moveBlock,
    undo,
    redo,
  } = useEditorStore();

  const scriptState = scripts[scriptId];
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);

  useEffect(() => {
    initializeScript(scriptId);
  }, [scriptId, initializeScript]);

  // Undo / Redo Global Keybinds
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo(scriptId);
        } else {
          undo(scriptId);
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [scriptId, undo, redo]);

  // Typewriter Scrolling
  useEffect(() => {
    if (isFocusMode && activeBlockId) {
      const el = document.getElementById(`block-${activeBlockId}`);
      if (el) {
        // Delay slightly for dom render
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      }
    }
  }, [activeBlockId, isFocusMode]);

  if (!scriptState)
    return <div className="p-8 text-center">Loading editor...</div>;

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    id: string,
    index: number,
  ) => {
    const textarea = e.currentTarget;
    const content = textarea.value;

    // Shift + Enter -> Allow multiline for certain blocks (like action)
    if (e.key === "Enter" && e.shiftKey) {
      return;
    }

    // Enter -> Add new block below
    if (e.key === "Enter") {
      e.preventDefault();
      const newBlockId = addBlock(scriptId, index);
      requestAnimationFrame(() => setActiveBlockId(newBlockId));
    }

    // Tab -> Cycle block type (Shift+Tab to reverse)
    if (e.key === "Tab") {
      e.preventDefault();
      cycleBlockType(scriptId, id, e.shiftKey);
    }

    // Backspace -> Delete block if empty (except very first block)
    if (e.key === "Backspace" && content === "") {
      if (scriptState.blocks.length > 1) {
        e.preventDefault();
        deleteBlock(scriptId, id);

        // Focus previous block
        if (index > 0) {
          const prevBlock = scriptState.blocks[index - 1];
          setActiveBlockId(prevBlock.id);
        }
      }
    }

    // Up/Down Arrows -> Navigate between blocks
    if (e.key === "ArrowUp") {
      if (textarea.selectionStart === 0 && index > 0) {
        e.preventDefault();
        const prevBlock = scriptState.blocks[index - 1];
        setActiveBlockId(prevBlock.id);
      }
    }
    if (e.key === "ArrowDown") {
      if (
        textarea.selectionEnd === content.length &&
        index < scriptState.blocks.length - 1
      ) {
        e.preventDefault();
        const nextBlock = scriptState.blocks[index + 1];
        setActiveBlockId(nextBlock.id);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== dropId) {
      moveBlock(scriptId, draggedId, dropId);
    }
  };

  // Derive scene numbers & scene navigation index
  let sceneCounter = 1;
  const scenesList: { id: string; num: number; content: string }[] = [];

  const blocksWithScenes = scriptState.blocks.map((block) => {
    let sceneNum = undefined;
    if (block.type === "scene_heading") {
      sceneNum = sceneCounter++;
      scenesList.push({ id: block.id, num: sceneNum, content: block.content });
    }
    return { ...block, sceneNum };
  });

  return (
    <div className="flex justify-center relative w-full px-4 sm:px-0 transition-all duration-300">
      {/* Settings / Floating Utilities */}
      <div
        id="editor-floating-tools"
        className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 print:hidden"
      >
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className={cn(
            "group relative p-4 rounded-3xl shadow-xl border transition-all duration-300 flex items-center justify-center",
            isNavOpen
              ? "bg-primary text-primary-foreground border-primary shadow-primary/20 scale-105"
              : "bg-background/40 text-muted-foreground border-border/40 backdrop-blur-2xl hover:bg-primary/10 hover:text-primary hover:border-primary/30",
          )}
        >
          <List className="w-5 h-5" />
          <span className="absolute right-full mr-4 whitespace-nowrap bg-background/80 backdrop-blur-3xl text-foreground font-brand tracking-[0.1em] text-[10px] px-3 py-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl">
            {isNavOpen ? "HIDE SCENES" : "SHOW SCENES"}
          </span>
        </button>
        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={cn(
            "group relative p-4 rounded-3xl shadow-xl border transition-all duration-300 flex items-center justify-center",
            isFocusMode
              ? "bg-primary text-primary-foreground border-primary shadow-primary/30 scale-105"
              : "bg-background/40 text-muted-foreground border-border/40 backdrop-blur-2xl hover:bg-primary/10 hover:text-primary hover:border-primary/30",
          )}
        >
          <Target className="w-5 h-5" />
          <span className="absolute right-full mr-4 whitespace-nowrap bg-background/80 backdrop-blur-3xl text-foreground font-brand tracking-[0.1em] text-[10px] px-3 py-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl">
            {isFocusMode ? "DISABLE FOCUS" : "FOCUS MODE"}
          </span>
        </button>
      </div>

      {/* Scene Navigator Sidebar */}
      <div
        id="scene-navigator"
        className={cn(
          "hidden xl:block fixed left-10 top-32 w-72 max-h-[calc(100vh-12rem)] overflow-y-auto bg-background/30 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl transition-all duration-500 print:hidden z-40",
          !isNavOpen &&
            "-translate-x-[150%] opacity-0 pointer-events-none scale-95",
        )}
      >
        <h3 className="font-semibold text-xs uppercase tracking-wider text-zinc-500 mb-4 px-2">
          Scenes
        </h3>
        <div className="space-y-1">
          {scenesList.map((scene) => (
            <button
              key={scene.id}
              onClick={() => {
                document
                  .getElementById(`block-${scene.id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
                setActiveBlockId(scene.id);
              }}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded-md text-[13px] font-medium truncate transition-colors",
                activeBlockId === scene.id
                  ? "bg-primary/20 text-primary font-bold shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
              )}
            >
              <span className="font-mono text-[11px] opacity-50 mr-2">
                {scene.num}
              </span>
              {(scene.content || "Untitled Scene").toUpperCase()}
            </button>
          ))}
          {scenesList.length === 0 && (
            <div className="text-xs text-zinc-400 px-2 italic">
              No scenes yet.
            </div>
          )}
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div
        className={cn(
          "w-full max-w-[850px] mx-auto mb-32 transition-all duration-500 ",
          "print:max-w-none print:m-0 print:p-0 print:w-full",
          isFocusMode ? "mt-12" : "mt-32",
        )}
      >
        <div
          id="script-editor-canvas"
          className={cn(
            "space-y-0 relative bg-white dark:bg-zinc-900 border border-border rounded-sm shadow-[0_10px_50px_rgba(0,0,0,0.04)] py-12 lg:py-24 px-4 sm:px-12 lg:px-[100px] print:p-0 print:m-0 print:border-none print:shadow-none print:bg-white print:text-black print:min-h-0",
            "editor-page-strip overflow-x-hidden sm:overflow-x-visible",
          )}
        >
          {/* Page Break Labels - Only show up to actual length */}
          {Array.from({
            length: Math.max(
              1,
              Math.ceil((blocksWithScenes.length * 60) / 1056),
            ),
          }).map((_, i) => (
            <div
              key={i + 1}
              className="editor-page-strip-label print:hidden"
              style={{ top: `${(i + 1) * 1056}px` }}
            >
              PAGE {i + 1}
            </div>
          ))}{" "}
          {blocksWithScenes.map((block, index) => (
            <EditorBlock
              key={block.id}
              block={block}
              allBlocks={scriptState.blocks}
              sceneNumber={block.sceneNum}
              isFocusMode={isFocusMode}
              index={index}
              isActive={block.id === activeBlockId}
              onUpdate={(id, content) => updateBlock(scriptId, id, content)}
              onKeyDown={handleKeyDown}
              onFocus={() => setActiveBlockId(block.id)}
              onDragStart={(e, id) => handleDragStart(e, id)}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e, id) => handleDrop(e, id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
