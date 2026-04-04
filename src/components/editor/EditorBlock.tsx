"use client";

import TextareaAutosize from "react-textarea-autosize";
import { ScreenplayBlock } from "@/lib/editor-types";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { GripVertical, GripHorizontal } from "lucide-react";
import { useBlockSuggestions } from "@/hooks/useBlockSuggestions";
import { getStylesForType } from "@/lib/editor-constants";

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
  allBlocks: ScreenplayBlock[];
  sceneNumber?: number;
  isFocusMode?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
}

export function EditorBlock({
  block,
  isActive,
  onUpdate,
  onKeyDown,
  onFocus,
  index,
  allBlocks,
  sceneNumber,
  isFocusMode,
  onDragStart,
  onDragOver,
  onDrop,
}: EditorBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestions = useBlockSuggestions(isActive, block, allBlocks);

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
  }, [isActive]);

  const handleBlur = () => {
    if (block.type === "parenthetical" && block.content.trim() !== "") {
      let updatedContent = block.content.trim();
      if (!updatedContent.startsWith("(")) updatedContent = "(" + updatedContent;
      if (!updatedContent.endsWith(")")) updatedContent = updatedContent + ")";

      if (updatedContent !== block.content) {
        onUpdate(block.id, updatedContent);
      }
    }
  };

  const handleKeyDownWrapper = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Markdown-style Formatting (Cmd/Ctrl + B, I, U)
    if ((e.metaKey || e.ctrlKey) && (e.key === "b" || e.key === "i" || e.key === "u")) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) return;

      const char = e.key === "b" ? "**" : e.key === "i" ? "*" : "_";
      const selectedText = block.content.substring(start, end);
      const newContent =
        block.content.substring(0, start) +
        char +
        selectedText +
        char +
        block.content.substring(end);

      onUpdate(block.id, newContent);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start + char.length, end + char.length);
        }
      });
      return;
    }

    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev === -1 ? 0 : (prev + 1) % suggestions.length));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        if (selectedIndex !== -1) {
          e.preventDefault();
          onUpdate(block.id, suggestions[selectedIndex]);
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
        "group flex relative w-full",
        isFocusMode && !isActive && "opacity-30 transition-opacity",
      )}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, block.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, block.id)}
    >
      {/* Block Type Indicator */}
      <div
        className={cn(
          "absolute -left-8 top-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] font-brand uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary text-muted-foreground hidden sm:block print:hidden",
          isActive && "opacity-100 bg-primary/20 text-primary shadow-sm",
        )}
      >
        {block.type.replace("_", " ")}
      </div>

      {/* Drag Handles */}
      {isActive && (
        <>
          <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 active:opacity-100 cursor-grab text-zinc-400 hidden sm:block print:hidden transition-opacity">
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 opacity-100 cursor-grab px-6 py-2 sm:hidden print:hidden flex justify-center items-center h-4 text-[#136F63]/30 hover:text-[#136F63]/80 transition-colors z-10 bg-linear-to-b from-transparent via-[#136F63]/5 to-transparent rounded-full w-32">
            <GripHorizontal className="h-4 w-5" />
          </div>
        </>
      )}

      {/* Scene Numbering */}
      {block.type === "scene_heading" && sceneNumber !== undefined && (
        <div className="absolute right-0 top-1.5 font-bold text-sm text-zinc-400 print:text-black">
          {sceneNumber}
        </div>
      )}

      <TextareaAutosize
        ref={textareaRef}
        placeholder={block.type === "scene_heading" ? "INT. LOCATION - DAY" : block.type}
        value={block.content}
        onChange={(e) => {
          onUpdate(block.id, e.target.value);
          setSelectedIndex(-1);
        }}
        onKeyDown={handleKeyDownWrapper}
        onFocus={onFocus}
        onBlur={handleBlur}
        className={cn(
          "resize-none outline-none bg-transparent placeholder:text-zinc-300 py-1 overflow-hidden transition-colors duration-300",
          "font-courier text-[13px] sm:text-[16px] lg:text-[18px] leading-[1.4] sm:leading-[1.3]",
          "print:hidden",
          getStylesForType(block.type),
        )}
        spellCheck={false}
      />

      {/* Print View Rendering */}
      <div
        className={cn(
          "hidden print:block whitespace-pre-wrap py-1 print:text-black font-courier text-[12pt] leading-none",
          `print-${block.type}`,
        )}
      >
        {block.content || "\u00A0"}
      </div>

      {/* Suggestion Dropdown */}
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
}
