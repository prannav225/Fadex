"use client";

import { createPortal } from "react-dom";
import { ScreenplayBlock } from "@/lib/editor-types";
import { cn } from "@/lib/utils";

interface PrintContainerProps {
  blocks: ScreenplayBlock[];
}

export function PrintContainer({ blocks }: PrintContainerProps) {
  // Use dynamic import { ssr: false } in Editor.tsx for this component
  return createPortal(
    <div id="fadex-print-container" className="hidden print:block">
      {blocks.map((block) => (
        <div
          key={block.id}
          className={cn(
            "print-block",
            block.type === "scene_heading" && "print-scene_heading",
            block.type === "action" && "print-action",
            block.type === "character" && "print-character",
            block.type === "dialogue" && "print-dialogue",
            block.type === "parenthetical" && "print-parenthetical",
            block.type === "transition" && "print-transition",
            block.type === "shot" && "print-shot"
          )}
        >
          {block.content || "\u00A0"}
        </div>
      ))}
    </div>,
    document.body
  );
}
