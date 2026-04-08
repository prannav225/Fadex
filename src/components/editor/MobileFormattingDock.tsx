import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BlockType } from "@/lib/editor-types";
import { useMobileKeyboard } from "@/hooks/useMobileKeyboard";

interface MobileFormattingDockProps {
  scriptId: string;
  activeBlockId: string | null;
  activeBlockType?: BlockType;
  changeBlockType: (scriptId: string, id: string, type: BlockType) => void;
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
}: MobileFormattingDockProps) {
  const { isKeyboardVisible } = useMobileKeyboard();
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

  if (!activeBlockId) return null;

  return (
    <div
      style={{
        top: isKeyboardVisible ? (viewportOffsetTop + 64) : "auto",
        transition: "top 0.1s ease-out",
        willChange: "top"
      }}
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50 print:hidden overflow-hidden",
        isKeyboardVisible 
          ? "top-[64px] bottom-auto left-0 translate-x-0 w-full bg-zinc-950/80 backdrop-blur-2xl border-b border-white/5 shadow-lg rounded-none" 
          : "bottom-[max(1rem,env(safe-area-inset-bottom))] top-auto w-[calc(100%-32px)] max-w-2xl bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
      )}
    >
      <div className="relative flex items-center">
        {/* Left Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-[#121212] to-transparent z-10 pointer-events-none" />
        
        <div className="flex items-center gap-1 overflow-x-auto px-6 py-2.5 hide-scrollbar snap-x no-scrollbar w-full">
          {FORMAT_OPTIONS.map((fmt) => (
            <button
              key={fmt.type}
              onClick={() => {
                changeBlockType(scriptId, activeBlockId, fmt.type as BlockType);
                
                // Haptic feedback for mobile - subtle tactile pulse
                if (typeof window !== "undefined" && window.navigator.vibrate) {
                  window.navigator.vibrate(10);
                }

                // Force focus back to textarea
                setTimeout(() => {
                  const el = document.getElementById(`block-${activeBlockId}`);
                  el?.querySelector("textarea")?.focus();
                }, 50);
              }}
              className={cn(
                "snap-center shrink-0 px-4 py-2 rounded-xl text-[10px] font-brand uppercase tracking-[0.2em] transition-all duration-300",
                activeBlockType === fmt.type
                  ? "bg-[#136F63] text-white shadow-lg shadow-[#136F63]/30 font-black scale-105"
                  : "bg-white/5 text-white/40 hover:text-white",
              )}
            >
              {fmt.label}
            </button>
          ))}
        </div>

        {/* Right Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-[#121212] to-transparent z-10 pointer-events-none" />
      </div>

      {/* Modern Home Indicator Gap (when no keyboard) */}
      {!isKeyboardVisible && <div className="h-2 w-full" />}
    </div>
  );
}
