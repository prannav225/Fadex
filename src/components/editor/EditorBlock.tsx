"use client";

import React, { useRef, useEffect, useState, memo } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ScreenplayBlock } from "@/lib/editor-types";
import { cn } from "@/lib/utils";
import { GripVertical, GripHorizontal } from "lucide-react";
import { useBlockSuggestions } from "@/hooks/useBlockSuggestions";
import { getStylesForType } from "@/lib/editor-constants";
import { renderFountainText } from "@/lib/fountain-renderer";

interface EditorBlockProps {
  block: ScreenplayBlock;
  isActive: boolean;
  onUpdate: (id: string, content: string) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    id: string,
    index: number,
  ) => void;
  onFocus: () => void;
  index: number;
  allBlocks?: ScreenplayBlock[]; // Deprecated, use suggestionsRegistry
  suggestionsRegistry: {
    characters: string[];
    locations: string[];
    transitions: string[];
    shots: string[];
  };
  sceneNumber?: number;
  isFocusMode?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
}

// --- OPTIMIZED SUB-COMPONENTS ---

const BlockTypeIndicator = memo(
  ({ type, isActive }: { type: string; isActive: boolean }) => (
    <div
      className={cn(
        "absolute left-4 top-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[9px] font-brand uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-400 hidden sm:block print:hidden shadow-sm",
        isActive && "opacity-100 bg-primary/20 text-primary",
      )}
    >
      {type.replace("_", " ")}
    </div>
  ),
);
BlockTypeIndicator.displayName = "BlockTypeIndicator";

const DragHandles = memo(({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  return (
    <>
      <div className="absolute left-1 top-2.5 opacity-0 group-hover:opacity-100 active:opacity-100 cursor-grab text-zinc-300 hidden sm:block print:hidden transition-opacity">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 -top-2 opacity-100 cursor-grab px-6 py-2 sm:hidden print:hidden flex justify-center items-center h-4 text-[#136F63]/30 hover:text-[#136F63]/80 transition-colors z-10 bg-linear-to-b from-transparent via-[#136F63]/5 to-transparent rounded-full w-32">
        <GripHorizontal className="h-4 w-5" />
      </div>
    </>
  );
});
DragHandles.displayName = "DragHandles";

const EditorBlockComponent = ({
  block,
  isActive,
  onUpdate,
  onKeyDown,
  onFocus,
  index,
  suggestionsRegistry,
  sceneNumber,
  isFocusMode,
  onDragStart,
  onDragOver,
  onDrop,
}: EditorBlockProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localContent, setLocalContent] = useState(block.content);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestions = useBlockSuggestions(isActive, localContent, block.type, suggestionsRegistry);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [prevContent, setPrevContent] = useState(block.content);

  // Sync with external content changes (e.g. undo/redo or formatting) during render
  if (block.content !== prevContent) {
    setPrevContent(block.content);
    setLocalContent(block.content);
  }

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
  }, [isActive]);

  const handleUpdate = (content: string) => {
    setLocalContent(content);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Sync to global store after a short pause
    // For mobile, we use a longer debounce to prevent re-renders while typing
    debounceRef.current = setTimeout(() => {
      onUpdate(block.id, content);
    }, 500);
  };

  const handleBlur = () => {
    // Immediate sync on blur
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (localContent !== block.content) {
      onUpdate(block.id, localContent);
    }

    if (block.type === "parenthetical" && localContent.trim() !== "") {
      let updatedContent = localContent.trim();
      if (!updatedContent.startsWith("("))
        updatedContent = "(" + updatedContent;
      if (!updatedContent.endsWith(")")) updatedContent = updatedContent + ")";

      if (updatedContent !== localContent) {
        setLocalContent(updatedContent);
        onUpdate(block.id, updatedContent);
      }
    }
  };

  const handleKeyDownWrapper = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    const key = e.key.toLowerCase();

    // Rich Text Formatting (Bold/Italic/Underline)
    if (
      (e.metaKey || e.ctrlKey) &&
      (key === "b" || key === "i" || key === "u")
    ) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) return;

      const char = key === "b" ? "**" : key === "i" ? "*" : "_";
      const selectedText = localContent.substring(start, end);
      const newContent =
        localContent.substring(0, start) +
        char +
        selectedText +
        char +
        localContent.substring(end);

      handleUpdate(newContent);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(
            start + char.length,
            end + char.length,
          );
        }
      });
      return;
    }

    // Auto-suggestions interaction
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === -1 ? 0 : (prev + 1) % suggestions.length,
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1,
        );
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        if (selectedIndex !== -1) {
          e.preventDefault();
          handleUpdate(suggestions[selectedIndex]);
          setSelectedIndex(-1);
          return;
        }
      }
      if (e.key === "Escape") {
        setSelectedIndex(-1);
        return;
      }
    }
    onKeyDown(e, block.id, index);
  };

  return (
    <div
      id={`block-${block.id}`}
      className={cn(
        "group flex relative w-full editor-block",
        isFocusMode && !isActive && "opacity-30 transition-opacity",
      )}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, block.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, block.id)}
    >
      <BlockTypeIndicator type={block.type} isActive={isActive} />
      <DragHandles isActive={isActive} />

      {block.type === "scene_heading" && sceneNumber !== undefined && (
        <div className="absolute right-0 top-1.5 font-bold text-sm text-zinc-400 print:text-black">
          {sceneNumber}
        </div>
      )}

      <TextareaAutosize
        ref={textareaRef}
        placeholder={
          block.type === "scene_heading" ? "INT. LOCATION - DAY" : block.type
        }
        value={localContent}
        onChange={(e) => {
          handleUpdate(e.target.value);
          setSelectedIndex(-1);
        }}
        onKeyDown={handleKeyDownWrapper}
        onFocus={onFocus}
        onBlur={handleBlur}
        className={cn(
          "resize-none outline-none bg-transparent placeholder:text-zinc-300 py-1 overflow-hidden transition-colors duration-300",
          "font-courier",
          "print:hidden",
          getStylesForType(block.type),
        )}
        spellCheck={false}
      />

      {/* Print rendering layer */}
      <div
        className={cn(
          "hidden print:block whitespace-pre-wrap py-1 print:text-black font-courier text-[12pt] leading-none",
          `print-${block.type}`,
        )}
      >
        {renderFountainText(block.content || "")}
      </div>

      {/* Suggestion layer */}
      {isActive && suggestions.length > 0 && (
        <ul
          className={cn(
            "absolute z-50 top-full left-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg",
            getStylesForType(block.type),
          )}
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={(e) => {
                e.preventDefault();
                onUpdate(block.id, s);
              }}
              className={cn(
                "px-3 py-2 cursor-pointer font-sans text-sm text-left normal-case transition-colors",
                i === selectedIndex
                  ? "bg-zinc-200 dark:bg-zinc-600 font-semibold text-black dark:text-white"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-700/50 text-zinc-900 dark:text-zinc-300",
              )}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const EditorBlock = memo(EditorBlockComponent, (prev, next) => {
  return (
    prev.isActive === next.isActive &&
    prev.block.id === next.block.id &&
    prev.block.content === next.block.content &&
    prev.block.type === next.block.type &&
    prev.sceneNumber === next.sceneNumber &&
    prev.isFocusMode === next.isFocusMode &&
    prev.index === next.index
  );
});

EditorBlock.displayName = "EditorBlock";
