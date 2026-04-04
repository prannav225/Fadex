"use client";

import { useScriptsStore } from "@/store/scripts";
import { useEditorStore } from "@/store/editor";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Undo2,
  Redo2,
  Printer,
  FileDown,
  Target,
  List,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EditorHeaderProps {
  scriptId: string;
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  isFocusMode: boolean;
  setIsFocusMode: (open: boolean) => void;
  isPrintReady: boolean;
  setIsPrintReady: (open: boolean) => void;
  setIsShortcutsOpen: (open: boolean) => void;
  setIsExportOpen: (open: boolean) => void;
}

export function EditorHeader({
  scriptId,
  isNavOpen,
  setIsNavOpen,
  isFocusMode,
  setIsFocusMode,
  isPrintReady,
  setIsPrintReady,
  setIsShortcutsOpen,
  setIsExportOpen,
}: EditorHeaderProps) {
  const { scripts } = useScriptsStore();
  const { undo, redo, scripts: editorScripts } = useEditorStore();
  const script = scripts.find((s) => s.id === scriptId);
  const scriptData = editorScripts[scriptId];

  const canUndo = scriptData?.past?.length > 0;
  const canRedo = scriptData?.future?.length > 0;

  return (
    <header className="fixed top-0 left-0 right-0 h-[64px] lg:h-[80px] bg-[#F9F7F2]/95 dark:bg-[#121212]/95 backdrop-blur-[20px] border-b border-zinc-200 dark:border-white/5 z-50 transition-all duration-500 flex items-center px-2 lg:px-8 justify-between shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)]">
      {/* Left Area: Navigation and History */}
      <div className="flex items-center gap-2 lg:gap-6">
        <Link href="/dashboard">
          <Button
            size="icon"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 w-10 h-10 lg:w-12 lg:h-12 shadow-lg shadow-primary/20 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </Button>
        </Link>

        <div className="flex flex-col min-w-0 mr-1 lg:mr-4 max-w-[120px] sm:max-w-none">
          <span className="font-brand text-[9px] uppercase tracking-[0.4em] text-primary/60 font-black mb-1 hidden sm:block">
            Fadex Studio
          </span>
          <h1 className="font-display font-black text-[16px] lg:text-[20px] text-foreground tracking-tight truncate leading-tight">
            {script?.title || "Untitled Script"}
          </h1>
        </div>

        <div className="h-10 w-px bg-zinc-200 dark:bg-white/10 mx-2 hidden lg:block" />

        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => undo(scriptId)}
            disabled={!canUndo}
            className="rounded-full w-10 h-10 text-zinc-400 hover:text-primary hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-20 transition-all flex items-center justify-center cursor-pointer"
          >
            <Undo2 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => redo(scriptId)}
            disabled={!canRedo}
            className="rounded-full w-10 h-10 text-zinc-400 hover:text-primary hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-20 transition-all flex items-center justify-center cursor-pointer"
          >
            <Redo2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Right Area: Features and Export */}
      <div className="flex items-center gap-1.5 lg:gap-4">
        {/* Toggle Group */}
        <div className="flex items-center bg-white dark:bg-zinc-900/50 rounded-full p-1 lg:p-1.5 border border-zinc-100 dark:border-white/5 shadow-inner shadow-black/2 gap-0.5 lg:gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNavOpen(!isNavOpen)}
            className={cn(
              "rounded-full gap-2 px-3 lg:px-4 h-9 lg:h-11 font-brand text-[9px] lg:text-[10px] tracking-widest transition-all duration-300",
              isNavOpen
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-zinc-500 hover:text-primary hover:bg-primary/5",
            )}
          >
            <List className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden lg:inline">OUTLINE</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={cn(
              "rounded-full gap-2 px-3 lg:px-4 h-9 lg:h-11 font-brand text-[9px] lg:text-[10px] tracking-widest transition-all duration-300",
              isFocusMode
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-zinc-500 hover:text-primary hover:bg-primary/5",
            )}
          >
            <Target className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden lg:inline">FOCUS</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPrintReady(!isPrintReady)}
            className={cn(
              "rounded-full gap-2 px-3 lg:px-4 h-9 lg:h-11 font-brand text-[9px] lg:text-[10px] tracking-widest transition-all duration-300 cursor-pointer",
              isPrintReady
                ? "bg-[#191919] dark:bg-white text-white dark:text-zinc-900 shadow-lg"
                : "text-zinc-500 hover:text-[#191919] hover:bg-zinc-100",
            )}
          >
            <Printer className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden lg:inline">PAPER</span>
          </Button>
        </div>

        <div className="h-8 w-px bg-zinc-200 dark:bg-white/10 mx-0.5 lg:mx-2 hidden sm:block" />

        <Button
          onClick={() => setIsShortcutsOpen(true)}
          className="rounded-full w-10 h-10 lg:w-12 lg:h-12 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-white/10 text-zinc-400 hover:text-primary hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-primary/40 transition-all shadow-sm group flex items-center justify-center p-0 cursor-pointer"
        >
          <HelpCircle className="w-5 h-5 lg:w-6 lg:h-6 text-zinc-400 group-hover:text-primary" />
        </Button>

        <Button
          onClick={() => setIsExportOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-10 lg:h-12 px-3 lg:px-8 font-brand text-[8px] lg:text-[11px] tracking-widest lg:tracking-[0.25em] uppercase transition-all duration-500 shadow-[0_10px_20px_-10px_rgba(19,111,99,0.4)] hover:shadow-[0_15px_30px_-10px_rgba(19,111,99,0.5)] font-black border border-primary-foreground/10 group overflow-hidden relative cursor-pointer shrink-0"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <FileDown className="w-3.5 h-3.5 lg:w-4 lg:h-4 lg:mr-3 opacity-70" />
          <span className="hidden lg:inline">Export</span>
        </Button>
      </div>
    </header>
  );
}
