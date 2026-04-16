"use client";

import { createPortal } from "react-dom";
import { paginateBlocks, PageData, PaginatedBlock } from "@/lib/pagination";
import { ScreenplayBlock } from "@/lib/editor-types";
import { renderFountainText } from "@/lib/fountain-renderer";
import { cn } from "@/lib/utils";
import { getStylesForType } from "@/lib/editor-constants";

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

export function PrintContainer({ blocks, metadata }: PrintContainerProps) {
  // Always use STRICT pagination for PDF export to ensure zero orphans/widows
  const pages = paginateBlocks(blocks, true);

  return createPortal(
    <div id="fadex-print-container" className="hidden print:block">
      {/* Title Page - Simplified to User Request */}
      {metadata && (
        <div className="print-title-page">
          <div className="print-title-top-shim" />
          <div className="print-title-main">{metadata.title.toUpperCase()}</div>
          <div className="print-title-sub">written by</div>
          <div className="print-title-author">
            {metadata.author || "Unknown Author"}
          </div>
          {metadata.based_on && (
            <div className="print-title-notes">
              {metadata.based_on}
            </div>
          )}
          {metadata.contact_info && (
            <div className="print-title-contact">
              {metadata.contact_info}
            </div>
          )}
        </div>
      )}

      {/* Script Body - Paginated for High Fidelity */}
      {pages.map((pageBlocks: PageData, pageIdx: number) => (
        <div 
          key={pageIdx} 
          className={cn(
            "print-page",
            pageIdx === pages.length - 1 && "print-page-last"
          )}
        >
          {pageBlocks.map((block: PaginatedBlock) => (
            <div
              key={block.id}
              className={cn(
                "whitespace-pre-wrap",
                getStylesForType(block.type)
              )}
            >
              {renderFountainText(block.content || "")}
            </div>
          ))}
          
          {/* Page Number */}
          <div className="print-page-number">
            {pageIdx + 1}.
          </div>
        </div>
      ))}
    </div>,
    document.body,
  );
}
