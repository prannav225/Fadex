import { cn } from "@/lib/utils";
import { BlockType } from "@/lib/editor-types";
import { useMobileKeyboard } from "@/hooks/useMobileKeyboard";
import { Undo2, Redo2 } from "lucide-react";

interface MobileFormattingDockProps {
  scriptId: string;
  activeBlockId: string | null;
  activeBlockType?: BlockType;
  changeBlockType: (scriptId: string, id: string, type: BlockType) => void;
  undo: (scriptId: string) => void;
  redo: (scriptId: string) => void;
}

const FORMAT_OPTIONS = [
  { label: "SCENE", type: "scene_heading" },
  { label: "ACTION", type: "action" },
  { label: "CHARACTER", type: "character" },
  { label: "DIALOGUE", type: "dialogue" },
  { label: "PARENTHETICAL", type: "parenthetical" },
  { label: "TRANSITION", type: "transition" },
  { label: "SHOT", type: "shot" },
];

export function MobileFormattingDock({
  scriptId,
  activeBlockId,
  activeBlockType,
  changeBlockType,
  undo,
  redo,
}: MobileFormattingDockProps) {
  const { isKeyboardVisible } = useMobileKeyboard();

  if (!activeBlockId) return null;

  return (
    <div
      style={{
        bottom: isKeyboardVisible ? "0" : "max(1.5rem, env(safe-area-inset-bottom))",
        transition: "bottom 0.1s ease-out, transform 0.2s ease-out",
        willChange: "bottom, transform",
        transform: activeBlockId ? "translate(-50%, 0)" : "translate(-50%, 100%)",
      }}
      className={cn(
        "fixed left-1/2 z-50 print:hidden overflow-hidden flex flex-col transition-all duration-300",
        isKeyboardVisible
          ? "w-full rounded-none bg-zinc-950/90 backdrop-blur-3xl border-t border-white/10"
          : "w-[calc(100%-32px)] md:w-auto md:max-w-4xl bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_30px_70px_rgba(0,0,0,0.6)]",
      )}
    >
      {/* Immersive Drag Indicator (Mobile Only, No Keyboard) */}
      {!isKeyboardVisible && (
        <div className="flex justify-center pt-2 sm:hidden">
          <div className="w-10 h-1 bg-white/10 rounded-full" />
        </div>
      )}

      {/* Dock Header - History Controls (Desktop Only) */}
      {!isKeyboardVisible && (
        <div className="hidden sm:flex items-center justify-between px-8 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-3">
            <button
              onClick={() => {
                undo(scriptId);
                if (window.navigator.vibrate) window.navigator.vibrate(5);
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 text-white/60 hover:bg-[#136F63]/20 hover:text-[#136F63] border border-white/5 transition-all text-[9px] font-brand uppercase tracking-widest active:scale-95"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Undo
            </button>
            <button
              onClick={() => {
                redo(scriptId);
                if (window.navigator.vibrate) window.navigator.vibrate(5);
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 text-white/60 hover:bg-[#136F63]/20 hover:text-[#136F63] border border-white/5 transition-all text-[9px] font-brand uppercase tracking-widest active:scale-95"
              title="Redo (Ctrl+Y)"
            >
              Redo
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-[9px] text-white/10 font-brand uppercase tracking-[0.4em] font-black italic">
            Architectural Precision
          </div>
        </div>
      )}

      <div className="relative flex items-center h-16 sm:h-20">
        {/* Visual Fade Insets */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />

        <div className="flex items-center gap-2 overflow-x-auto px-8 w-full premium-scrollbar snap-x no-scrollbar">
          {FORMAT_OPTIONS.map((fmt) => (
            <button
              key={fmt.type}
              onClick={() => {
                changeBlockType(scriptId, activeBlockId, fmt.type as BlockType);

                // Haptic feedback - subtle tactical pulse for premium feel
                if (typeof window !== "undefined" && window.navigator.vibrate) {
                  window.navigator.vibrate(8);
                }

                // Smoothly refocus
                setTimeout(() => {
                  const el = document.getElementById(`block-${activeBlockId}`);
                  el?.querySelector("textarea")?.focus();
                }, 10);
              }}
              className={cn(
                "snap-center shrink-0 px-5 py-2.5 rounded-2xl text-[9px] lg:text-[10px] font-brand uppercase tracking-[0.25em] transition-all duration-300 active:scale-90",
                activeBlockType === fmt.type
                  ? "bg-[#136F63] text-white shadow-xl shadow-[#136F63]/40 font-black scale-105"
                  : "bg-white/5 text-white/30 hover:text-white hover:bg-white/10",
              )}
            >
              {fmt.label}
            </button>
          ))}
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Safety padding for modern devices */}
      {!isKeyboardVisible && <div className="h-4 sm:h-2 w-full" />}
    </div>
  );
}
