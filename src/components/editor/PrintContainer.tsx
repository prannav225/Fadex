"use client";

import { createPortal } from "react-dom";
import { ScreenplayBlock } from "@/lib/editor-types";
import { cn } from "@/lib/utils";

interface PrintContainerProps {
  blocks: ScreenplayBlock[];
  metadata?: {
    title: string;
    author?: string;
    based_on?: string;
    contact_info?: string;
    status?: string;
  };
}

import { renderFountainText } from "@/lib/fountain-renderer";

export function PrintContainer({ blocks, metadata }: PrintContainerProps) {
  // Use dynamic import { ssr: false } in Editor.tsx for this component
  return createPortal(
    <div id="fadex-print-container" className="hidden print:block">
      {/* Title Page */}
      {metadata && (
        <div className="print-title-page">
          <div className="print-title-top-shim" />
          <div className="print-title-main">{metadata.title.toUpperCase()}</div>
          <div className="print-title-sub">written by</div>
          <div className="print-title-author">
            {metadata.author || "Unknown Author"}
          </div>

          {metadata.based_on && (
            <div className="print-title-notes">{metadata.based_on}</div>
          )}

          {metadata.status && (
            <div className="print-title-status">{metadata.status}</div>
          )}

          {metadata.contact_info && (
            <div className="print-title-contact">{metadata.contact_info}</div>
          )}
        </div>
      )}

      {/* Script Body */}
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
            block.type === "shot" && "print-shot",
          )}
        >
          {renderFountainText(block.content || "")}
        </div>
      ))}
    </div>,
    document.body,
  );
}
