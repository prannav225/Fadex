"use client";

import { useScriptsStore } from "@/store/scripts";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  FileDown,
  Target,
  List,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface EditorHeaderProps {
  scriptId: string;
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  isFocusMode: boolean;
  setIsFocusMode: (open: boolean) => void;
  setIsShortcutsOpen: (open: boolean) => void;
  setIsExportOpen: (open: boolean) => void;
}

export function EditorHeader({
  scriptId,
  isNavOpen,
  setIsNavOpen,
  isFocusMode,
  setIsFocusMode,
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
        transition: "top 0.15s ease-out",
        willChange: "top"
      }}
      className="fixed left-0 right-0 h-[60px] lg:h-[80px] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 z-50 transition-all duration-500 flex items-center px-4 lg:px-8 justify-between shadow-sm"
    >
      {/* Left Area: Navigation and Title */}
      <div className="flex items-center gap-3 lg:gap-6 min-w-0">
        <Link href="/dashboard" className="shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full bg-black/5 hover:bg-[#136F63] hover:text-white text-black/60 transition-all duration-300 w-10 h-10 lg:w-11 lg:h-11 active:scale-90 cursor-pointer flex items-center justify-center border border-black/[0.03]"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </Button>
        </Link>

        <div className="flex flex-col min-w-0 max-w-[120px] sm:max-w-none">
          <span className="font-brand text-[8px] uppercase tracking-[0.4em] text-[#136F63] font-black mb-0.5 hidden sm:block opacity-60">
            Studio Draft
          </span>
          <h1 className="font-display font-black text-[13px] lg:text-[18px] text-foreground tracking-tight truncate leading-tight">
            {script?.title || "Untitled Script"}
          </h1>
        </div>
      </div>

      {/* Right Area: Features and Export */}
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        {/* Compact Toggle Group */}
        <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-full p-1 gap-0.5 border border-black/[0.03]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsNavOpen(!isNavOpen);
              if (typeof window !== "undefined" && window.navigator.vibrate) window.navigator.vibrate(5);
            }}
            className={cn(
              "rounded-full px-2 lg:px-4 h-9 lg:h-10 font-brand text-[8px] lg:text-[10px] tracking-widest transition-all duration-300 active:scale-95",
              isNavOpen
                ? "bg-white dark:bg-zinc-800 text-[#136F63] shadow-sm font-black"
                : "text-black/40 hover:text-[#136F63] hover:bg-white/50",
            )}
          >
            <List className="w-4 h-4" />
            <span className="hidden lg:inline ml-2">NAV</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsFocusMode(!isFocusMode);
              if (typeof window !== "undefined" && window.navigator.vibrate) window.navigator.vibrate(5);
            }}
            className={cn(
              "rounded-full px-2 lg:px-4 h-9 lg:h-10 font-brand text-[8px] lg:text-[10px] tracking-widest transition-all duration-300 active:scale-95",
              isFocusMode
                ? "bg-white dark:bg-zinc-800 text-[#136F63] shadow-sm font-black"
                : "text-black/40 hover:text-[#136F63] hover:bg-white/50",
            )}
          >
            <Target className="w-4 h-4" />
            <span className="hidden lg:inline ml-2">FOCUS</span>
          </Button>
        </div>

        <div className="h-8 w-px bg-black/5 dark:bg-white/5 mx-1 hidden sm:block" />

        <Button
          onClick={() => {
            setIsExportOpen(true);
            if (typeof window !== "undefined" && window.navigator.vibrate) window.navigator.vibrate(10);
          }}
          className="bg-[#136F63] hover:bg-[#191919] text-[#FDFCF9] rounded-full h-9 lg:h-11 w-9 lg:w-auto p-0 lg:px-8 font-brand text-[8px] lg:text-[11px] tracking-widest lg:tracking-[0.2em] uppercase transition-all duration-500 shadow-xl shadow-[#136F63]/20 font-black group active:scale-95 cursor-pointer"
        >
          <FileDown className="w-4 h-4 lg:mr-2" />
          <span className="hidden lg:inline">Export</span>
        </Button>

        <Button
          onClick={() => setIsShortcutsOpen(true)}
          className="rounded-full w-9 h-9 lg:w-11 lg:h-11 bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 text-black/40 hover:bg-[#136F63] hover:text-white transition-all hidden sm:flex items-center justify-center p-0 cursor-pointer shadow-sm active:scale-90"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
