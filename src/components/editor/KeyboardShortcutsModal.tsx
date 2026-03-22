"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Keyboard, X } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ isOpen, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-[96vw] max-h-[92vh] overflow-y-auto sm:max-w-3xl md:max-w-4xl rounded-3xl sm:rounded-[2.5rem] border border-border/50 bg-background/80 backdrop-blur-3xl shadow-2xl p-5 sm:p-8 md:p-12 grid-cols-1! custom-scrollbar">
        <DialogClose className="absolute top-4 right-4 sm:top-8 sm:right-8 rounded-full p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors ring-offset-background focus:ring-2 focus:ring-ring focus:outline-none z-50">
          <X className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader className="mb-6 sm:mb-8 pr-8 sm:pr-12">
          <DialogTitle className="font-brand uppercase tracking-widest text-xl sm:text-2xl md:text-3xl text-foreground flex items-center gap-3 sm:gap-4">
            <Keyboard className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
            Shortcuts
          </DialogTitle>
          <DialogDescription className="font-display text-muted-foreground text-xs sm:text-sm md:text-base mt-1 sm:mt-2">
            Master the screenwriter&apos;s flow with these essential keystrokes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 relative">
          {/* Desktop Vertical Divider */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-8 w-px bg-border/40 -translate-x-[0.5px]" />

          {/* Formatting */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-brand text-[10px] tracking-widest text-muted-foreground uppercase opacity-80 pb-1">
              Formatting & Elements
            </h4>
            <div className="flex flex-col font-display text-sm sm:text-[15px] divide-y divide-border/20 border-t border-b border-border/40">
              <div className="flex justify-between items-center group gap-4 py-3.5">
                <span className="text-foreground/80 group-hover:text-foreground transition-colors leading-tight">Cycle Element Type</span>
                <div className="flex gap-2 font-sans whitespace-nowrap shrink-0">
                  <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs shadow-sm font-medium">Tab</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center group gap-4 py-3 sm:py-3.5">
                <span className="text-foreground/80 group-hover:text-foreground transition-colors leading-tight">Cycle Backwards</span>
                <div className="flex flex-wrap justify-end items-center gap-1.5 font-sans shrink-0">
                  <kbd className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-medium">Shift</kbd>
                  <span className="text-muted-foreground/50 text-[10px] sm:text-xs font-bold">+</span>
                  <kbd className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-medium">Tab</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center group gap-4 py-3.5">
                <span className="text-foreground/80 group-hover:text-foreground transition-colors leading-tight">Add New Block Below</span>
                <div className="flex gap-2 font-sans whitespace-nowrap shrink-0">
                  <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs shadow-sm font-medium">Enter</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center group gap-4 py-3 sm:py-3.5 border-b-0">
                <span className="text-foreground/80 group-hover:text-foreground transition-colors leading-tight">Multiline Block</span>
                <div className="flex flex-wrap justify-end items-center gap-1.5 font-sans shrink-0">
                  <kbd className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-medium">Shift</kbd>
                  <span className="text-muted-foreground/50 text-[10px] sm:text-xs font-bold">+</span>
                  <kbd className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-medium">Enter</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation & Editing */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-brand text-[10px] tracking-widest text-muted-foreground uppercase opacity-80 pb-1">
              Navigation & Editing
            </h4>
            <div className="flex flex-col font-display text-sm sm:text-[15px] divide-y divide-border/20 border-t border-b border-border/40">
              <div className="flex justify-between items-center group gap-4 py-3.5">
                <span className="text-foreground/80 group-hover:text-foreground transition-colors leading-tight">Delete Empty Block</span>
                <div className="flex gap-2 font-sans whitespace-nowrap shrink-0">
                  <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs shadow-sm font-medium">Backspace</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center group gap-4 py-3.5">
                <span className="text-foreground/80 group-hover:text-foreground transition-colors leading-tight">Navigate Blocks</span>
                <div className="flex items-center gap-2 font-sans whitespace-nowrap shrink-0">
                  <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs shadow-sm font-medium">↑</kbd>
                  <span className="text-muted-foreground/50 text-xs font-bold">/</span>
                  <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs shadow-sm font-medium">↓</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center group gap-4 py-3 sm:py-3.5">
                <span className="text-foreground/80 group-hover:text-foreground transition-colors leading-tight">Undo</span>
                <div className="flex flex-wrap justify-end items-center gap-1.5 font-sans shrink-0">
                  <kbd className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-medium">Cmd/Ctrl</kbd>
                  <span className="text-muted-foreground/50 text-[10px] sm:text-xs font-bold">+</span>
                  <kbd className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-medium">Z</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center group gap-4 py-3 sm:py-3.5 border-b-0">
                <span className="text-foreground/80 group-hover:text-foreground transition-colors leading-tight">Redo</span>
                <div className="flex flex-wrap justify-end items-center gap-1 sm:gap-1.5 font-sans shrink-0">
                  <kbd className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-medium">Cmd/Ctrl</kbd>
                  <span className="text-muted-foreground/50 text-[10px] sm:text-xs font-bold">+</span>
                  <kbd className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-medium">Shift</kbd>
                  <span className="text-muted-foreground/50 text-[10px] sm:text-xs font-bold">+</span>
                  <kbd className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-medium">Z</kbd>
                </div>
              </div>
            </div>
          </div>
          
          {/* Global Actions */}
          <div className="col-span-1 md:col-span-2 space-y-3 mt-4 pt-6 border-t border-border/30">
            <h4 className="font-brand text-xs tracking-widest text-muted-foreground uppercase opacity-80 pb-1">
              Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-5 font-display text-[15px]">
              <div className="flex flex-col gap-1.5 group">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <span className="text-foreground/80 group-hover:text-foreground transition-colors font-semibold">Focus Mode</span>
                </div>
                <span className="text-[13.5px] text-muted-foreground italic leading-relaxed pl-3.5">
                  Keeps your active line centered with typewriter scrolling.
                </span>
              </div>
              <div className="flex flex-col gap-1.5 group">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <span className="text-foreground/80 group-hover:text-foreground transition-colors font-semibold">Drag & Drop</span>
                </div>
                <span className="text-[13.5px] text-muted-foreground italic leading-relaxed pl-3.5">
                  Reorder blocks effortlessly via the left drag handle.
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
