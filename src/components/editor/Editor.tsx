"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/store/editor";
import { EditorBlock } from "./EditorBlock";
import { BlockType } from "@/lib/editor-types";
import { cn } from "@/lib/utils";
import { Target, List, Keyboard, X } from "lucide-react";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";

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
    changeBlockType,
  } = useEditorStore();

  const scriptState = scripts[scriptId];
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const activeBlock = scriptState?.blocks.find((b) => b.id === activeBlockId);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Detect mobile keyboard
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleResize = () => {
      const isVisible =
        window.visualViewport!.height < window.innerHeight - 150;
      setIsKeyboardVisible(isVisible);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    return () =>
      window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    initializeScript(scriptId);
  }, [scriptId, initializeScript]);

  // Mobile Auto-Close Navigator
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      setIsNavOpen(false);
    }
  }, []);

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
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* Settings / Floating Utilities */}
      <div
        id="editor-floating-tools"
        className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 flex flex-col gap-2 z-20 print:hidden"
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
          <span className="absolute right-full mr-4 whitespace-nowrap bg-background/80 backdrop-blur-3xl text-foreground font-brand tracking-widest text-[10px] px-3 py-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl">
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
          <span className="absolute right-full mr-4 whitespace-nowrap bg-background/80 backdrop-blur-3xl text-foreground font-brand tracking-widest text-[10px] px-3 py-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl">
            {isFocusMode ? "DISABLE FOCUS" : "FOCUS MODE"}
          </span>
        </button>
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className={cn(
            "group relative p-4 rounded-3xl shadow-xl border transition-all duration-300 flex items-center justify-center",
            isShortcutsOpen
              ? "bg-primary text-primary-foreground border-primary shadow-primary/30 scale-105"
              : "bg-background/40 text-muted-foreground border-border/40 backdrop-blur-2xl hover:bg-primary/10 hover:text-primary hover:border-primary/30",
          )}
        >
          <Keyboard className="w-5 h-5" />
          <span className="absolute right-full mr-4 whitespace-nowrap bg-background/80 backdrop-blur-3xl text-foreground font-brand tracking-widest text-[10px] px-3 py-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl">
            SHORTCUTS
          </span>
        </button>
      </div>

      {/* Backdrop Overlay for Mobile */}
      <div
        onClick={() => setIsNavOpen(false)}
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-500",
          isNavOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Main Structural Content - Split from Flex to fix Chrome positioning */}
      <div className="flex flex-col lg:flex-row items-start justify-center pt-20 lg:pt-32 px-4 lg:px-8">
        <div
          id="scene-navigator"
          className={cn(
            "z-40 shrink-0 overflow-y-auto overflow-x-hidden bg-background/95 lg:bg-background/30 backdrop-blur-3xl border-r lg:border border-white/10 lg:rounded-[2.5rem] shadow-2xl transition-all duration-500 print:hidden",

            // Layout Geometry
            "fixed top-24 sm:top-28 left-2 w-[calc(94vw-16px)] max-w-[420px] h-fit max-h-[75vh] p-4 sm:p-6 rounded-3xl lg:sticky lg:top-32 lg:w-72 lg:h-[calc(100vh-12rem)] lg:mr-8 lg:mt-0 lg:pt-6 lg:pb-6 lg:ml-0 lg:left-0 lg:rounded-[2.5rem]",

            // Open/Close States
            isNavOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-[120%] lg:-translate-x-[150%] lg:w-0 lg:p-0 lg:m-0 opacity-0 pointer-events-none",
          )}
        >
          <div className="flex items-center justify-between mb-4 lg:mb-6 px-2">
            <h3 className="font-semibold text-[10px] lg:text-xs uppercase tracking-[0.2em] text-[#136f63]/60">
              Scenes
            </h3>
            <button
              onClick={() => setIsNavOpen(false)}
              className="lg:hidden p-2 -mr-2 rounded-full hover:bg-black/5 text-[#136f63]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {scenesList.map((scene) => (
              <button
                key={scene.id}
                onClick={() => {
                  document
                    .getElementById(`block-${scene.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  setActiveBlockId(scene.id);
                  if (window.innerWidth < 1024) setIsNavOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2.5 lg:py-1.5 rounded-xl lg:rounded-md text-[13px] font-medium transition-all group/scene animate-in fade-in slide-in-from-left-2",
                  activeBlockId === scene.id
                    ? "bg-[#136f63] text-white font-bold shadow-lg shadow-[#136f63]/20 scale-[1.02]"
                    : "text-zinc-500 hover:bg-[#136f63]/5 hover:text-[#136f63]",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] mr-2",
                    activeBlockId === scene.id
                      ? "text-white/70"
                      : "text-[#136f63]/50",
                  )}
                >
                  {scene.num}
                </span>
                <span className="whitespace-normal leading-tight">
                  {(scene.content || "Untitled Scene").toUpperCase()}
                </span>
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
            "w-full max-w-[850px] mb-32 shrink",
            "print:max-w-none print:m-0 print:p-0 print:w-full",
            isFocusMode ? "mt-6" : "mt-8 lg:mt-0",
          )}
        >
          <div
            id="script-editor-canvas"
            className={cn(
              "space-y-0 relative bg-white dark:bg-zinc-900 border border-border rounded-sm shadow-[0_10px_50px_rgba(0,0,0,0.04)] py-8 sm:py-12 lg:py-24 px-4 sm:px-12 lg:px-[100px] print:p-0 print:m-0 print:border-none print:shadow-none print:bg-white print:text-black print:min-h-0",
              "editor-page-strip overflow-x-hidden sm:overflow-x-visible",
            )}
          >
            {/* Page Break Labels */}
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
            ))}
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

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />

      {/* Mobile Formatting Dock - Bold brutalist editorial design */}
      <div
        style={{
          bottom:
            typeof window !== "undefined" && window.visualViewport
              ? Math.max(0, window.innerHeight - window.visualViewport.height)
              : 0,
        }}
        className={cn(
          "fixed left-0 right-0 w-full z-50 bg-[#191919] border-t border-[#136F63]/30 pt-3 pb-8 sm:hidden shadow-[0_-20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 print:hidden",
          isKeyboardVisible && "pb-4", // Reduce padding when keyboard is up for more screen space
        )}
      >
        <div className="flex items-center overflow-x-auto hide-scrollbar snap-x">
          {[
            { label: "SCENE", type: "scene_heading" },
            { label: "ACTION", type: "action" },
            { label: "CHARACTER", type: "character" },
            { label: "DIALOGUE", type: "dialogue" },
            { label: "PARENTHETICAL", type: "parenthetical" },
            { label: "TRANSITION", type: "transition" },
            { label: "SHOT", type: "shot" },
          ].map((fmt) => (
            <button
              key={fmt.type}
              onClick={() => {
                if (activeBlockId) {
                  changeBlockType(
                    scriptId,
                    activeBlockId,
                    fmt.type as BlockType,
                  );
                  // Ensure focus is retained after changing type by finding textarea
                  const el = document.getElementById(`block-${activeBlockId}`);
                  const textarea = el?.querySelector("textarea");
                  textarea?.focus({ preventScroll: true });
                }
              }}
              className={cn(
                "snap-start shrink-0 px-5 py-3 text-[10px] font-brand uppercase tracking-[0.3em] border-r border-white/10 last:border-r-0 transition-all duration-300",
                activeBlock?.type === fmt.type
                  ? "bg-[#136F63] text-[#F3EFE0] font-black shadow-[inset_0_-2px_0_#F3EFE0]"
                  : "bg-transparent text-white/50 hover:text-white hover:bg-white/5",
              )}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
