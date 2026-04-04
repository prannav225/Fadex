"use client";

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

  if (!activeBlockId) return null;

  return (
    <div
      style={{
        bottom:
          typeof window !== "undefined" && window.visualViewport
            ? Math.max(0, window.innerHeight - window.visualViewport.height)
            : 0,
      }}
      className={cn(
        "fixed left-0 right-0 w-full z-50 bg-[#191919] border-t border-[#136F63]/30 pt-3 pb-8 sm:hidden shadow-[0_-20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 print:hidden",
        isKeyboardVisible && "pb-4",
      )}
    >
      <div className="flex items-center overflow-x-auto hide-scrollbar snap-x">
        {FORMAT_OPTIONS.map((fmt) => (
          <button
            key={fmt.type}
            onClick={() => {
              changeBlockType(scriptId, activeBlockId, fmt.type as BlockType);
              const el = document.getElementById(`block-${activeBlockId}`);
              const textarea = el?.querySelector("textarea");
              textarea?.focus({ preventScroll: true });
            }}
            className={cn(
              "snap-start shrink-0 px-5 py-3 text-[10px] font-brand uppercase tracking-[0.3em] border-r border-white/10 last:border-r-0 transition-all duration-300",
              activeBlockType === fmt.type
                ? "bg-[#136F63] text-[#F3EFE0] font-black shadow-[inset_0_-2px_0_#F3EFE0]"
                : "bg-transparent text-white/50 hover:text-white hover:bg-white/5",
            )}
          >
            {fmt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
