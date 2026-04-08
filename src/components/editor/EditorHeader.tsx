"use client";

import { useScriptsStore } from "@/store/scripts";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
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

import { useEffect, useState } from "react";

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
  const script = scripts.find((s) => s.id === scriptId);

  const [viewportOffsetTop, setViewportOffsetTop] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleViewport = () => {
      window.requestAnimationFrame(() => {
        setViewportOffsetTop(window.visualViewport?.offsetTop || 0);
      });
    };

    window.visualViewport.addEventListener("resize", handleViewport);
    window.visualViewport.addEventListener("scroll", handleViewport);
    handleViewport();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewport);
      window.visualViewport?.removeEventListener("scroll", handleViewport);
    };
  }, []);

  return (
    <header 
      style={{ 
        top: viewportOffsetTop, 
        transition: "top 0.1s ease-out",
        willChange: "top"
      }}
      className="fixed left-0 right-0 h-[64px] lg:h-[80px] bg-white/95 dark:bg-zinc-900/95 sm:bg-[#F9F7F2]/95 sm:dark:bg-[#121212]/95 backdrop-blur-[20px] border-b border-zinc-200 dark:border-white/5 z-50 transition-all duration-500 flex items-center px-3 lg:px-8 justify-between shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)]"
    >
      {/* Left Area: Navigation and History */}
      <div className="flex items-center gap-2 lg:gap-6 min-w-0">
        <Link href="/dashboard" className="shrink-0">
          <Button
            size="icon"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 w-9 h-9 lg:w-12 lg:h-12 shadow-lg shadow-primary/20 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </Button>
        </Link>

        <div className="flex flex-col min-w-0 max-w-[140px] sm:max-w-none">
          <span className="font-brand text-[9px] uppercase tracking-[0.4em] text-primary/60 font-black mb-1 hidden sm:block">
            Fadex Studio
          </span>
          <h1 className="font-display font-black text-[14px] lg:text-[20px] text-foreground tracking-tight truncate leading-tight">
            {script?.title || "Untitled Script"}
          </h1>
        </div>

        <div className="h-8 w-px bg-zinc-200 dark:bg-white/10 mx-2 hidden lg:block" />
      </div>

      {/* Right Area: Features and Export */}
      <div className="flex items-center gap-1 lg:gap-4 shrink-0">
        {/* Toggle Group */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 border border-zinc-200 dark:border-white/5 shadow-inner gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNavOpen(!isNavOpen)}
            className={cn(
              "rounded-full px-2 lg:px-4 h-8 lg:h-11 font-brand text-[8px] lg:text-[10px] tracking-widest transition-all duration-300",
              isNavOpen
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-zinc-500 hover:text-primary hover:bg-primary/5",
            )}
          >
            <List className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden lg:inline ml-2">OUTLINE</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={cn(
              "rounded-full px-2 lg:px-4 h-8 lg:h-11 font-brand text-[8px] lg:text-[10px] tracking-widest transition-all duration-300",
              isFocusMode
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-zinc-500 hover:text-primary hover:bg-primary/5",
            )}
          >
            <Target className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden lg:inline ml-2">FOCUS</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPrintReady(!isPrintReady)}
            className={cn(
              "rounded-full px-2 lg:px-4 h-8 lg:h-11 font-brand text-[8px] lg:text-[10px] tracking-widest transition-all duration-300 cursor-pointer",
              isPrintReady
                ? "bg-black text-white dark:bg-white dark:text-zinc-900 shadow-lg"
                : "text-zinc-500 hover:text-black hover:bg-zinc-100",
            )}
          >
            <Printer className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden lg:inline ml-2">PAPER</span>
          </Button>
        </div>

        <div className="h-8 w-px bg-zinc-200 dark:bg-white/10 mx-1 hidden sm:block" />

        <Button
          onClick={() => setIsExportOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-8 lg:h-12 w-8 lg:w-auto p-0 lg:px-8 font-brand text-[8px] lg:text-[11px] tracking-widest lg:tracking-[0.25em] uppercase transition-all duration-500 shadow-lg font-black group relative cursor-pointer"
        >
          <FileDown className="w-4 h-4" />
          <span className="hidden lg:inline ml-2">Export</span>
        </Button>

        <Button
          onClick={() => setIsShortcutsOpen(true)}
          className="rounded-full w-8 h-8 lg:w-12 lg:h-12 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-400 hover:text-primary transition-all hidden sm:flex items-center justify-center p-0 cursor-pointer"
        >
          <HelpCircle className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
        </Button>
      </div>
    </header>
  );
}
