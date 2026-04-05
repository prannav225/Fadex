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

export function KeyboardShortcutsModal({
  isOpen,
  onOpenChange,
}: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[96vw] max-h-[92vh] overflow-y-auto sm:max-w-3xl md:max-w-4xl rounded-3xl sm:rounded-[2.5rem] border border-border/50 bg-background/80 backdrop-blur-3xl shadow-2xl p-5 sm:p-8 md:p-12 grid-cols-1! custom-scrollbar"
      >
        <DialogClose className="absolute top-4 right-4 sm:top-8 sm:right-8 rounded-full p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors ring-offset-background focus:ring-2 focus:ring-ring focus:outline-none z-50">
          <X className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader className="mb-6 sm:mb-10 pr-8 sm:pr-12">
          <DialogTitle className="font-brand uppercase tracking-[0.3em] text-xl sm:text-2xl md:text-3xl text-foreground flex items-center gap-3 sm:gap-4 font-black">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Keyboard className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
            </div>
            Studio Guide
          </DialogTitle>
          <DialogDescription className="font-display text-muted-foreground text-xs sm:text-sm md:text-base mt-2 leading-relaxed max-w-2xl">
            Welcome to the FadeX masterclass. Master these cinematic controls to
            stay in the flow and shape your narrative with precision.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 relative">
          {/* Desktop Vertical Divider */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-8 w-px bg-border/20 -translate-x-[0.5px]" />

          {/* Column 1: Cinematic Formatting */}
          <div className="space-y-6">
            <div>
              <h4 className="font-brand text-[10px] tracking-[0.3em] text-primary font-black uppercase pb-3 border-b border-primary/10 mb-4">
                Cinematic Elements
              </h4>
              <div className="flex flex-col font-display text-sm sm:text-[14px]">
                <div className="flex justify-between items-center group py-3 border-b border-border/10">
                  <span className="text-foreground/70 group-hover:text-foreground transition-colors">
                    Cycle Element Type
                  </span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-mono font-bold">
                    TAB
                  </kbd>
                </div>
                <div className="flex justify-between items-center group py-3 border-b border-border/10">
                  <span className="text-foreground/70 group-hover:text-foreground transition-colors">
                    Cycle Backwards
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-bold text-zinc-400">
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      SHIFT
                    </kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      TAB
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center group py-3 border-b border-border/10">
                  <span className="text-foreground/70 group-hover:text-foreground transition-colors">
                    New Logical Element
                  </span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-mono font-bold">
                    ENTER
                  </kbd>
                </div>
                <div className="flex justify-between items-center group py-3">
                  <span className="text-foreground/70 group-hover:text-foreground transition-colors">
                    Manual Line Break
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-bold text-zinc-400">
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      SHIFT
                    </kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      ENTER
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-brand text-[10px] tracking-[0.3em] text-primary font-black uppercase pb-3 border-b border-primary/10 mb-4">
                Rich Text Formatting
              </h4>
              <div className="flex flex-col font-display text-sm sm:text-[14px]">
                <div className="flex justify-between items-center group py-3 border-b border-border/10">
                  <span className="text-foreground/70 group-hover:text-foreground transition-colors font-bold">
                    Bold Text
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-bold text-zinc-400">
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      CMD/Ctrl
                    </kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      B
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center group py-3 border-b border-border/10">
                  <span className="text-foreground/70 group-hover:text-foreground transition-colors italic">
                    Italic Text
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-bold text-zinc-400">
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      CMD/Ctrl
                    </kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      I
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center group py-3">
                  <span className="text-foreground/70 group-hover:text-foreground transition-colors underline">
                    Underline Text
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-bold text-zinc-400">
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      CMD/Ctrl
                    </kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      U
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Studio Navigation & Logic */}
          <div className="space-y-6">
            <div>
              <h4 className="font-brand text-[10px] tracking-[0.3em] text-primary font-black uppercase pb-3 border-b border-primary/10 mb-4">
                Studio Navigation
              </h4>
              <div className="flex flex-col font-display text-sm sm:text-[14px]">
                <div className="flex justify-between items-center group py-3 border-b border-border/10">
                  <span className="text-foreground/70 group-hover:text-foreground transition-colors">
                    Switch Blocks
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-bold text-zinc-400">
                    <kbd className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      ↑
                    </kbd>
                    <span>/</span>
                    <kbd className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      ↓
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center group py-3 border-b border-border/10">
                  <span className="text-foreground/70 group-hover:text-foreground transition-colors">
                    Undo Action
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-bold text-zinc-400">
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      CMD/Ctrl
                    </kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm">
                      Z
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center group py-3 border-b border-border/10">
                  <span className="text-foreground/70 group-hover:text-foreground transition-colors">
                    Delete Element
                  </span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] sm:text-xs shadow-sm font-mono font-bold leading-normal">
                    BACKSPACE
                  </kbd>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-brand text-[10px] tracking-[0.3em] text-primary font-black uppercase pb-3 border-b border-primary/10 mb-4">
                Advanced Features
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-border/20 group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-brand text-[10px] font-black uppercase tracking-widest text-foreground">
                      Typewriter Scrolling
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed italic">
                    Enable Focus Mode to keep your active line perfectly
                    centered in the cinematic view.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-border/20 group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-brand text-[10px] font-black uppercase tracking-widest text-foreground">
                      Fountain Interop
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed italic">
                    FadeX uses industry-standard formatting. Import or export
                    .fountain files anytime.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-border/20 group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-brand text-[10px] font-black uppercase tracking-widest text-foreground">
                      Local First
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed italic">
                    Your scripts never leave your device. Secure, private
                    drafting with zero latency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
