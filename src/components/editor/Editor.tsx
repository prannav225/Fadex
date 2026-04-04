"use client";

import { useEffect, useState } from "react";
import { useScriptsStore } from "@/store/scripts";
import { useEditorStore } from "@/store/editor";
import { EditorBlock } from "./EditorBlock";
import { cn } from "@/lib/utils";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { ExportModal } from "./ExportModal";
import { EditorHeader } from "./EditorHeader";
import { ProjectSidebar } from "./ProjectSidebar";
import { MobileFormattingDock } from "./MobileFormattingDock";
import dynamic from "next/dynamic";

const PrintContainer = dynamic(
  () => import("./PrintContainer").then((mod) => mod.PrintContainer),
  { ssr: false }
);

interface EditorProps {
  scriptId: string;
}

export function Editor({ scriptId }: EditorProps) {
  const { scripts: dashboardScripts } = useScriptsStore();
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
  const activeBlock = scriptState?.blocks?.find((b) => b.id === activeBlockId);

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPrintReady, setIsPrintReady] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    if (scriptState?.blocks && activeBlockId) {
      const exists = scriptState.blocks.some((b) => b.id === activeBlockId);
      if (!exists) setActiveBlockId(null);
    }
  }, [scriptState?.blocks, activeBlockId]);

  useEffect(() => {
    initializeScript(scriptId);
  }, [scriptId, initializeScript]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      setIsNavOpen(false);
    }
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(scriptId);
        else undo(scriptId);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [scriptId, undo, redo]);

  useEffect(() => {
    if (isFocusMode && activeBlockId) {
      const el = document.getElementById(`block-${activeBlockId}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      }
    }
  }, [activeBlockId, isFocusMode]);

  if (!scriptState) return <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-950/80 backdrop-blur-3xl m-8 rounded-[2rem] border-2 border-dashed border-black/5 flex flex-col items-center justify-center min-h-[40vh] text-zinc-400 font-brand uppercase tracking-widest text-[10px]">Loading Editor...</div>;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string, index: number) => {
    const textarea = e.currentTarget;
    const content = textarea.value;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newBlockId = addBlock(scriptId, index);
      requestAnimationFrame(() => setActiveBlockId(newBlockId));
    }
    if (e.key === "Tab") {
      e.preventDefault();
      cycleBlockType(scriptId, id, e.shiftKey);
    }
    if (e.key === "Backspace" && content === "" && scriptState.blocks.length > 1) {
      e.preventDefault();
      deleteBlock(scriptId, id);
      if (index > 0) setActiveBlockId(scriptState.blocks[index - 1].id);
    }
    if (e.key === "ArrowUp" && textarea.selectionStart === 0 && index > 0) {
      e.preventDefault();
      setActiveBlockId(scriptState.blocks[index - 1].id);
    }
    if (e.key === "ArrowDown" && textarea.selectionEnd === content.length && index < scriptState.blocks.length - 1) {
      e.preventDefault();
      setActiveBlockId(scriptState.blocks[index + 1].id);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== dropId) moveBlock(scriptId, draggedId, dropId);
  };

  // Scene Mapping Logic
  let sceneCounter = 0;
  const scenesList: { id: string; num: number; content: string }[] = [];
  const blocksWithScenes = scriptState.blocks.map((block) => {
    const safeBlock = { id: block.id, type: block.type, content: block.content || "" };
    if (safeBlock.type === "scene_heading") {
      sceneCounter++;
      scenesList.push({ id: safeBlock.id, num: sceneCounter, content: safeBlock.content });
      return { ...safeBlock, sceneNumber: sceneCounter };
    }
    return { ...safeBlock, sceneNumber: undefined };
  });

  const currentScript = dashboardScripts.find((s) => s.id === scriptId);

  return (
    <div className={cn("relative min-h-[calc(100vh-8rem)] transition-colors duration-500", isPrintReady && "print-ready-mode")}>
      <EditorHeader
        scriptId={scriptId}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        isFocusMode={isFocusMode}
        setIsFocusMode={setIsFocusMode}
        isPrintReady={isPrintReady}
        setIsPrintReady={setIsPrintReady}
        setIsShortcutsOpen={setIsShortcutsOpen}
        setIsExportOpen={setIsExportOpen}
      />

      <div
        onClick={() => setIsNavOpen(false)}
        className={cn("fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-500", isNavOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
      />

      <div className="flex flex-col lg:flex-row items-start justify-center pt-24 lg:pt-32 px-4 lg:px-8">
        <ProjectSidebar
          scriptId={scriptId}
          isNavOpen={isNavOpen}
          setIsNavOpen={setIsNavOpen}
          scenesList={scenesList}
          activeBlockId={activeBlockId}
          setActiveBlockId={setActiveBlockId}
        />

        <div className={cn("w-full max-w-[850px] mb-32 shrink print:max-w-none print:m-0 print:p-0 print:w-full", isFocusMode ? "mt-6" : "mt-8 lg:mt-0")}>
          <div id="script-editor-canvas" className="space-y-0 relative bg-white dark:bg-zinc-900 border border-border rounded-sm shadow-[0_10px_50px_rgba(0,0,0,0.04)] py-8 sm:py-12 lg:py-24 px-4 sm:px-12 lg:px-[100px] print:p-0 print:m-0 print:border-none print:shadow-none print:bg-white print:text-black print:min-h-0 editor-page-strip overflow-x-hidden sm:overflow-x-visible">
            {/* Page Break Annotations */}
            {Array.from({ length: Math.max(1, Math.ceil((blocksWithScenes.length * 60) / 1056)) }).map((_, i) => (
              <div key={i + 1} className="editor-page-strip-label print:hidden" style={{ top: `${(i + 1) * 1056}px` }}>PAGE {i + 1}</div>
            ))}

            {blocksWithScenes.map((block, index) => (
              <EditorBlock
                key={block.id}
                block={block}
                allBlocks={scriptState.blocks}
                sceneNumber={block.sceneNumber}
                isFocusMode={isFocusMode}
                index={index}
                isActive={block.id === activeBlockId}
                onUpdate={(id, content) => updateBlock(scriptId, id, content)}
                onKeyDown={handleKeyDown}
                onFocus={() => setActiveBlockId(block.id)}
                onDragStart={(e, id) => handleDragStart(e, id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e, id) => handleDrop(e, id)}
              />
            ))}
          </div>
        </div>
      </div>

      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onOpenChange={setIsShortcutsOpen} />
      <ExportModal isOpen={isExportOpen} onOpenChange={setIsExportOpen} scriptId={scriptId} scriptTitle={currentScript?.title} />
      
      <MobileFormattingDock
        scriptId={scriptId}
        activeBlockId={activeBlockId}
        activeBlockType={activeBlock?.type}
        changeBlockType={changeBlockType}
      />

      {scriptState.blocks && (
        <PrintContainer
          blocks={scriptState.blocks}
          metadata={currentScript ? {
            title: currentScript.title,
            author: currentScript.author,
            based_on: currentScript.based_on,
            contact_info: currentScript.contact_info,
            status: currentScript.status,
          } : undefined}
        />
      )}
    </div>
  );
}
