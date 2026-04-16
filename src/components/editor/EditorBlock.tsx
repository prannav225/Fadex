"use client";

import React, { useRef, useEffect, useState, memo } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ScreenplayBlock } from "@/lib/editor-types";
import { cn } from "@/lib/utils";
import { GripVertical, ChevronRight } from "lucide-react";
import { useBlockSuggestions } from "@/hooks/useBlockSuggestions";
import { getStylesForType } from "@/lib/editor-constants";
import { renderFountainText } from "@/lib/fountain-renderer";

interface EditorBlockProps {
  block: ScreenplayBlock;
  isActive: boolean;
  onUpdate: (id: string, content: string, pushToHistory?: boolean) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    id: string,
    index: number,
  ) => void;
  onFocus: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  suggestionsRegistry: {
    characters: string[];
    locations: string[];
    transitions: string[];
    shots: string[];
  };
  sceneNumber?: number;
  isFocusMode?: boolean;
  index: number;
}

const BlockTypeIndicator = memo(
  ({ type, isActive }: { type: string; isActive: boolean }) => (
    <div
      className={cn(
        "absolute left-6 top-3 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[8px] font-brand uppercase tracking-[0.2em] px-3 py-1 rounded-lg bg-black/5 text-black/30 hidden sm:block print:hidden shadow-sm",
        isActive && "opacity-100 bg-[#136F63]/10 text-[#136F63] font-black",
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
      <div className="absolute left-1 top-2.5 opacity-0 group-hover:opacity-100 active:opacity-100 cursor-grab text-black/10 hover:text-[#136F63] hidden sm:block print:hidden transition-all active:scale-110">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 -top-2 opacity-100 cursor-grab px-8 py-2.5 sm:hidden print:hidden flex justify-center items-center h-4 text-[#136F63]/20 hover:text-[#136F63]/60 transition-colors z-10 bg-linear-to-b from-transparent via-[#136F63]/5 to-transparent rounded-full w-40">
        <div className="w-12 h-1 bg-[#136F63]/20 rounded-full" />
      </div>
    </>
  );
});
DragHandles.displayName = "DragHandles";

export const EditorBlock = memo((props: EditorBlockProps) => {
  const {
    block,
    isActive,
    onUpdate,
    onKeyDown,
    onFocus,
    onDragStart,
    onDragOver,
    onDrop,
    suggestionsRegistry,
    sceneNumber,
    isFocusMode,
    index,
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localContent, setLocalContent] = useState(block.content);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Sync local state with store only if content changed externally
  if (block.content !== localContent && !isActive) {
    setLocalContent(block.content);
  }

  // Focus management
  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
      // Ensure cursor is at the end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isActive]);

  const suggestions = useBlockSuggestions(
    isActive,
    localContent,
    block.type,
    suggestionsRegistry
  );

  const handleUpdate = (content: string) => {
    setLocalContent(content);
    onUpdate(block.id, content, false);
  };

  const handleBlur = () => {
    if (localContent !== block.content) {
      onUpdate(block.id, localContent, true);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onUpdate(block.id, suggestion, true);
    setLocalContent(suggestion);
    setSelectedIndex(-1);
    // Refocus textarea after selection
    setTimeout(() => textareaRef.current?.focus(), 10);
  };

  const handleKeyDownWrapper = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[selectedIndex]);
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
        "group relative w-full editor-block transition-all duration-500",
        `editor-${block.type}`,
        isActive ? "editor-block-active bg-black/[0.01] dark:bg-white/[0.01] shadow-[inset_0_0_0_1px_rgba(19,111,99,0.08)] rounded-[2.5rem]" : "border-transparent",
        isFocusMode && !isActive && "opacity-20 blur-[0.5px] transition-all duration-700",
      )}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, block.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, block.id)}
    >
      <BlockTypeIndicator type={block.type} isActive={isActive} />
      <DragHandles isActive={isActive} />

      {block.type === "scene_heading" && sceneNumber !== undefined && (
        <div className="absolute -left-12 top-2 font-brand font-black text-[10px] text-[#136F63]/20 print:hidden hidden lg:block">
          SC {sceneNumber}
        </div>
      )}

      <div className="relative w-full">
        {/* Visual Preview Layer - Shown when NOT active or in print */}
        <div
          onClick={onFocus}
          className={cn(
            "font-courier py-0 whitespace-pre-wrap w-full cursor-text min-h-[1.2em] transition-all duration-300",
            getStylesForType(block.type),
            isActive ? "hidden print:block" : "block",
            isActive && "opacity-0"
          )}
        >
          {renderFountainText(localContent || "")}
        </div>

        {/* Textarea Editor Layer - Shown when active (hidden in print) */}
        {isActive && (
          <TextareaAutosize
            ref={textareaRef}
            placeholder={
              block.type === "scene_heading" ? "INT. LOCATION - DAY" : block.type.toUpperCase()
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
              "resize-none outline-none bg-transparent placeholder:text-black/10 py-0 overflow-hidden transition-all duration-300 block w-full",
              "font-courier",
              "print:hidden",
              getStylesForType(block.type),
            )}
            spellCheck={false}
          />
        )}
      </div>

      {/* Suggestion layer - Optimized for Touch/Mobile */}
      {isActive && suggestions.length > 0 && (
        <ul
          className={cn(
            "absolute z-50 bottom-full left-0 mb-3 w-full sm:w-[320px] overflow-hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300",
          )}
        >
          <div className="px-6 py-3 border-b border-black/5 bg-black/[0.02] flex items-center justify-between">
            <span className="text-[8px] font-brand font-black uppercase tracking-[0.25em] text-[#136F63]">Suggestions</span>
            <div className="flex gap-1.5">
              <div className="w-1 h-1 rounded-full bg-[#136F63]/30" />
              <div className="w-1 h-1 rounded-full bg-[#136F63]/60" />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto premium-scrollbar p-2">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionSelect(s);
                  if (typeof window !== "undefined" && window.navigator.vibrate) window.navigator.vibrate(5);
                }}
                className={cn(
                  "px-5 py-4 cursor-pointer font-sans text-xs text-left normal-case transition-all rounded-2xl flex items-center justify-between group/item",
                  i === selectedIndex
                    ? "bg-[#136F63] text-white shadow-xl shadow-[#136F63]/25 font-bold scale-[1.02]"
                    : "hover:bg-black/5 text-black/60 dark:text-white/60 active:bg-black/10",
                )}
              >
                <span>{s}</span>
                <ChevronRight className={cn(
                  "w-3.5 h-3.5 transition-transform duration-300",
                  i === selectedIndex ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                )} />
              </li>
            ))}
          </div>
        </ul>
      )}
    </div>
  );
});

EditorBlock.displayName = "EditorBlock";
