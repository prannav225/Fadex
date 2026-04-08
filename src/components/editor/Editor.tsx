"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useScriptsStore } from "@/store/scripts";
import { useEditorStore } from "@/store/editor";
import { EditorBlock } from "./EditorBlock";
import { cn } from "@/lib/utils";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { ExportModal } from "./ExportModal";
import { EditorHeader } from "./EditorHeader";
import { ProjectSidebar } from "./ProjectSidebar";
import { MobileFormattingDock } from "./MobileFormattingDock";
import { paginateBlocks, PageData, PaginatedBlock } from "@/lib/pagination";
import { useEditorEvents } from "@/hooks/useEditorEvents";
import { useWindowSize } from "@/hooks/useWindowSize";
import dynamic from "next/dynamic";

const PrintContainer = dynamic(
  () => import("./PrintContainer").then((mod) => mod.PrintContainer),
  { ssr: false },
);

interface EditorProps {
  scriptId: string;
}

export function Editor({ scriptId }: EditorProps) {
  // --- STORE ACCESS ---
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

  // --- UI STATE ---
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPrintReady, setIsPrintReady] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  // --- RESPONSIVE STATE ---
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isTabletOrMobile = width < 1280;

  const scale = useMemo(() => {
    if (!isMobile) return 1;
    return Math.min(1, (width - 24) / 850);
  }, [width, isMobile]);

  // --- DEBOUNCED PAGINATION ---
  const [paginatedPages, setPaginatedPages] = useState<PageData[]>([]);
  const [isIdle, setIsIdle] = useState(true);
  const paginationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- DERIVED STATE ---
  const activeBlock = useMemo(
    () => scriptState?.blocks?.find((b) => b.id === activeBlockId),
    [scriptState, activeBlockId],
  );

  const scenesList = useMemo(() => {
    if (!scriptState?.blocks) return [];
    const list: { id: string; num: number; content: string }[] = [];
    scriptState.blocks.forEach((block) => {
      if (block.type === "scene_heading") {
        list.push({
          id: block.id,
          num: list.length + 1,
          content: block.content,
        });
      }
    });
    return list;
  }, [scriptState]);

  // HIGH PERFORMANCE: Pre-calculate suggestions registry to avoid O(N) loops in every block
  const suggestionsRegistry = useMemo(() => {
    if (!scriptState?.blocks) return { characters: [], locations: [], transitions: [], shots: [] };
    
    const characters = new Set<string>();
    const locations = new Set<string>();
    const transitions = new Set<string>();
    const shots = new Set<string>();

    scriptState.blocks.forEach((b) => {
      if (!b.content) return;
      const content = b.content.trim().toUpperCase();
      if (!content) return;

      if (b.type === "character") characters.add(content);
      if (b.type === "transition") transitions.add(content);
      if (b.type === "shot") shots.add(content);
      if (b.type === "scene_heading") {
        const matchLoc = b.content.match(/^(?:INT\.|EXT\.|INT\.\/EXT\.|EXT\.\/INT\.|I\/E\.)\s+(.*?)(?:\s*-|$)/i);
        if (matchLoc && matchLoc[1]) locations.add(matchLoc[1].trim().toUpperCase());
      }
    });

    return {
      characters: Array.from(characters).sort(),
      locations: Array.from(locations).sort(),
      transitions: Array.from(transitions).sort(),
      shots: Array.from(shots).sort(),
    };
  }, [scriptState]);

  const currentScript = useMemo(
    () => dashboardScripts.find((s) => s.id === scriptId),
    [dashboardScripts, scriptId],
  );

  // --- EFFECT: DEBOUNCED PAGINATION ---
  useEffect(() => {
    if (!scriptState?.blocks) return;

    // Reset idle state when content changes
    setIsIdle(false);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    
    // Set to idle after 2 seconds of inactivity
    idleTimeoutRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 2000);

    if (paginationTimeoutRef.current) clearTimeout(paginationTimeoutRef.current);

    const runPagination = () => {
      // Use STRICT pagination if on desktop, exported, or idle
      const isStrict = !isMobile || isIdle || isPrintReady;
      const pages = paginateBlocks(scriptState.blocks, isStrict);
      setPaginatedPages(pages);
    };

    // If mobile and not idle, use longer debounce for performance
    const delay = isMobile && !isIdle ? 400 : 50;
    paginationTimeoutRef.current = setTimeout(runPagination, delay);

    return () => {
      if (paginationTimeoutRef.current) clearTimeout(paginationTimeoutRef.current);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [scriptState, isMobile, isIdle, isPrintReady]);

  // --- CUSTOM HOOKS ---
  const { handleKeyDown } = useEditorEvents({
    scriptId,
    activeBlockId,
    blocks: scriptState?.blocks || [],
    addBlock,
    deleteBlock,
    changeBlockType,
    cycleBlockType,
    undo,
    redo,
    setActiveBlockId,
  });

  // --- EFFECTS ---

  // Initialization
  useEffect(() => {
    initializeScript(scriptId);
  }, [scriptId, initializeScript]);

  // Handle mobile responsive nav closure
  useEffect(() => {
    if (isTabletOrMobile && isNavOpen) {
      setIsNavOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTabletOrMobile]);

  // Cleanup orphaned active block IDs
  useEffect(() => {
    if (scriptState && activeBlockId) {
      const exists = scriptState.blocks.some((b) => b.id === activeBlockId);
      if (!exists) {
        // Defer state update to avoid cascading render warning during bulk deletes
        const timeout = setTimeout(() => setActiveBlockId(null), 0);
        return () => clearTimeout(timeout);
      }
    }
  }, [scriptState, activeBlockId]);

  // Center active block in focus mode
  useEffect(() => {
    if (isFocusMode && activeBlockId && !isMobile) {
      const el = document.getElementById(`block-${activeBlockId}`);
      if (el) {
        const timeout = setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
        return () => clearTimeout(timeout);
      }
    }
  }, [activeBlockId, isFocusMode, isMobile]);

  // --- HANDLERS ---
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, id: string) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      if (draggedId && draggedId !== dropId)
        moveBlock(scriptId, draggedId, dropId);
    },
    [scriptId, moveBlock],
  );

  // --- RENDER ---
  if (!scriptState) {
    return (
      <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-950/80 backdrop-blur-3xl m-8 rounded-[2rem] border-2 border-dashed border-black/5 flex flex-col items-center justify-center min-h-[40vh] text-zinc-400 font-brand uppercase tracking-widest text-[10px]">
        Loading Editor...
      </div>
    );
  }

  return (
    <div
      id="script-editor-root"
      className={cn(
        "relative transition-colors duration-500",
        isPrintReady && "print-ready-mode",
      )}
    >
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

      {/* Mobile Sidebar Overlay */}
      <div
        onClick={() => setIsNavOpen(false)}
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-500",
          isNavOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      <div className="flex flex-col lg:flex-row items-start justify-center">
        <ProjectSidebar
          scriptId={scriptId}
          isNavOpen={isNavOpen}
          setIsNavOpen={setIsNavOpen}
          scenesList={scenesList}
          activeBlockId={activeBlockId}
          setActiveBlockId={setActiveBlockId}
        />

        <div
          className={cn(
            "w-full mb-32 shrink print:max-w-none print:m-0 print:p-0 print:w-full flex justify-center",
            isFocusMode ? "pt-24 lg:pt-32" : "pt-[64px] lg:pt-32",
          )}
        >
          <div 
            id="script-editor-canvas"
            className="flex flex-col items-center gap-8 px-4 sm:px-0"
          >
            {paginatedPages.map((pageBlocks: PageData, pageIdx: number) => (
              <div 
                key={pageIdx} 
                className="editor-page print:shadow-none transition-transform duration-300 origin-top"
                style={{ 
                  transform: scale < 1 ? `scale(${scale})` : "none",
                  marginBottom: scale < 1 ? `-${1056 * (1 - scale)}px` : "2rem",
                  // MOBILE OPTIMIZATION: Only calculate layout for visible pages
                  contentVisibility: "auto",
                  containIntrinsicSize: "auto 1056px",
                }}
              >
                <div className="editor-page-strip-label print:hidden">
                  PAGE {pageIdx + 1}
                </div>

                {pageBlocks.map((block: PaginatedBlock) => (
                  <EditorBlock
                    key={`${block.id}-${block.type}`}
                    block={block}
                    suggestionsRegistry={suggestionsRegistry}
                    sceneNumber={block.sceneNumber}
                    isFocusMode={isFocusMode}
                    index={block.indexInFullList}
                    isActive={block.id === activeBlockId}
                    onUpdate={(id, content) =>
                      updateBlock(scriptId, id, content)
                    }
                    onKeyDown={handleKeyDown}
                    onFocus={() => setActiveBlockId(block.id)}
                    onDragStart={handleDragStart}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />
      <ExportModal
        isOpen={isExportOpen}
        onOpenChange={setIsExportOpen}
        scriptId={scriptId}
        scriptTitle={currentScript?.title}
      />

      <MobileFormattingDock
        scriptId={scriptId}
        activeBlockId={activeBlockId}
        activeBlockType={activeBlock?.type}
        changeBlockType={changeBlockType}
      />

      {scriptState.blocks && (
        <PrintContainer
          blocks={scriptState.blocks}
          metadata={
            currentScript
              ? {
                  title: currentScript.title,
                  author: currentScript.author,
                  based_on: currentScript.based_on,
                  contact_info: currentScript.contact_info,
                  status: currentScript.status,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
