import TextareaAutosize from "react-textarea-autosize";
import { ScreenplayBlock } from "@/lib/editor-types";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState, useMemo } from "react";

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

import { GripVertical } from "lucide-react";

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

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive]);

  const getStylesForType = (type: string) => {
    switch (type) {
      case "scene_heading":
        return "uppercase font-bold w-full text-foreground/90 mt-8 mb-4 tracking-wider text-xl drop-shadow-sm border-l-4 border-primary/40 pl-4 print:mt-6 print:mb-4";
      case "action":
        return "w-full text-foreground/80 mt-2 mb-2 leading-relaxed print:my-4";
      case "character":
        // 3.7" from paper edge -> 2.7" from margin
        return "uppercase w-fit mx-auto min-w-[40%] text-primary font-bold mt-6 tracking-wide print:ml-[2.7in] print:w-auto print:mx-0 print:mt-6";
      case "dialogue":
        // 2.5" from paper edge -> 1.5" from margin
        return "w-[65%] ml-[15%] text-black dark:text-zinc-200 print:ml-[1.5in] print:w-[3.5in]";
      case "parenthetical":
        // 3.1" from paper edge -> 2.1" from margin
        return "italic w-[50%] ml-[25%] text-black dark:text-zinc-200 mt-1 mb-1 print:ml-[2.1in] print:w-[2.5in]";
      case "transition":
        // Flush right: ~5.5 inches from left
        return "uppercase text-right w-full text-black dark:text-white mt-4 print:text-right print:mt-6";
      case "shot":
        return "uppercase font-bold w-full text-black dark:text-white mt-4 print:mt-4";
      case "montage":
        return "uppercase font-bold w-full text-zinc-600 dark:text-zinc-400 mt-4 print:mt-4";
      case "text_on_screen":
        return "italic w-[65%] ml-[15%] text-black dark:text-zinc-200 print:ml-[1.5in]";
      default:
        return "w-full";
    }
  };

  const handleBlur = () => {
    if (block.type === "parenthetical" && block.content.trim() !== "") {
      let updatedContent = block.content.trim();
      if (!updatedContent.startsWith("(")) {
        updatedContent = "(" + updatedContent;
      }
      if (!updatedContent.endsWith(")")) {
        updatedContent = updatedContent + ")";
      }

      if (updatedContent !== block.content) {
        onUpdate(block.id, updatedContent);
      }
    }
  };

  const suggestions = useMemo(() => {
    if (!isActive) return [];
    const contentToMatch =
      typeof block.content === "string" ? block.content : "";
    const lowerContent = contentToMatch.toLowerCase();

    if (block.type === "character") {
      if (!lowerContent) return [];
      const characters = new Set(
        allBlocks
          .filter(
            (b) =>
              b.type === "character" &&
              typeof b.content === "string" &&
              b.content.trim(),
          )
          .map((b) => b.content),
      );
      return Array.from(characters).filter(
        (c) =>
          typeof c === "string" &&
          c.toLowerCase().includes(lowerContent) &&
          c !== block.content,
      );
    }

    if (block.type === "scene_heading") {
      const isTimeMode = lowerContent.includes("-");

      if (isTimeMode) {
        const dashIndex = contentToMatch.lastIndexOf("-");
        let base = contentToMatch.substring(0, dashIndex + 1);
        let timeQuery = contentToMatch.substring(dashIndex + 1);
        if (timeQuery.startsWith(" ")) {
          base += " ";
          timeQuery = timeQuery.substring(1);
        } else {
          base += " ";
        }

        const customTimes = new Set<string>();
        allBlocks.forEach((b) => {
          if (b.type === "scene_heading" && typeof b.content === "string") {
            const match = b.content.match(/-\s*(.+)$/);
            if (match && match[1])
              customTimes.add(match[1].trim().toUpperCase());
          }
        });

        const standardTimes = [
          "DAY",
          "NIGHT",
          "MORNING",
          "EVENING",
          "CONTINUOUS",
          "LATER",
        ];

        const allTimes = Array.from(
          new Set([...standardTimes, ...Array.from(customTimes)]),
        );

        const matchedTimes = allTimes.filter((t) =>
          t.toLowerCase().startsWith(timeQuery.toLowerCase()),
        );
        return matchedTimes.map((t) => base + t);
      }

      const prefixMatch = contentToMatch.match(
        /^(INT\.|EXT\.|INT\.\/EXT\.|EXT\.\/INT\.|I\/E\.)\s+(.*)/i,
      );

      if (prefixMatch) {
        const prefix = prefixMatch[1].toUpperCase() + " ";
        const locQuery = prefixMatch[2].toLowerCase();

        const locations = new Set<string>();
        allBlocks.forEach((b) => {
          if (b.type === "scene_heading" && typeof b.content === "string") {
            const matchLoc = b.content.match(
              /^(?:INT\.|EXT\.|INT\.\/EXT\.|EXT\.\/INT\.|I\/E\.)\s+(.*?)(?:\s*-|$)/i,
            );
            if (matchLoc && matchLoc[1])
              locations.add(matchLoc[1].trim().toUpperCase());
          }
        });

        const matchedLocs = Array.from(locations).filter(
          (l) =>
            l.toLowerCase().includes(locQuery) && l !== locQuery.toUpperCase(),
        );
        return matchedLocs.map((l) => prefix + l + " - ");
      }

      const prefixes = ["INT. ", "EXT. ", "INT./EXT. "];
      if (!lowerContent) return prefixes;

      const isPrefixMatch = prefixes.filter((p) =>
        p.toLowerCase().startsWith(lowerContent),
      );
      if (isPrefixMatch.length > 0) return isPrefixMatch;

      return [];
    }

    if (block.type === "transition") {
      const standardTransitions = [
        "CUT TO:",
        "FADE IN:",
        "FADE OUT.",
        "DISSOLVE TO:",
        "SMASH CUT TO:",
        "MATCH CUT TO:",
        "INTERCUT WITH:",
      ];

      const customTransitions = new Set<string>();
      allBlocks.forEach((b) => {
        if (
          b.type === "transition" &&
          typeof b.content === "string" &&
          b.content.trim()
        ) {
          customTransitions.add(b.content.trim().toUpperCase());
        }
      });

      const allTransitions = Array.from(
        new Set([...standardTransitions, ...Array.from(customTransitions)]),
      );

      if (!lowerContent) return allTransitions;

      return allTransitions.filter(
        (t) =>
          t.toLowerCase().includes(lowerContent) &&
          t.toLowerCase() !== lowerContent,
      );
    }

    if (block.type === "shot") {
      const standardShots = [
        "ANGLE ON",
        "WIDE SHOT",
        "CLOSE UP",
        "EXTREME CLOSE UP",
        "POV",
        "REVERSE ANGLE",
        "PAN TO",
        "TRACKING SHOT",
        "AERIAL SHOT",
      ];

      const customShots = new Set<string>();
      allBlocks.forEach((b) => {
        if (
          b.type === "shot" &&
          typeof b.content === "string" &&
          b.content.trim()
        ) {
          customShots.add(b.content.trim().toUpperCase());
        }
      });

      const allShots = Array.from(
        new Set([...standardShots, ...Array.from(customShots)]),
      );

      if (!lowerContent) return allShots;

      return allShots.filter(
        (s) =>
          s.toLowerCase().includes(lowerContent) &&
          s.toLowerCase() !== lowerContent,
      );
    }

    return [];
  }, [isActive, block.content, block.type, allBlocks]);

  const handleKeyDownWrapper = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    // Formatting Shortcuts (Cmd/Ctrl + B, I, U)
    if (
      (e.metaKey || e.ctrlKey) &&
      (e.key === "b" || e.key === "i" || e.key === "u")
    ) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) return; // No text selected

      const char = e.key === "b" ? "**" : e.key === "i" ? "*" : "_";
      const selectedText = block.content.substring(start, end);
      const newContent =
        block.content.substring(0, start) +
        char +
        selectedText +
        char +
        block.content.substring(end);

      onUpdate(block.id, newContent);

      // Reselect the text after a brief render delay
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
          onUpdate(block.id, suggestions[selectedIndex]);
          setSelectedIndex(-1);
          return;
        }
        // If nothing is selected, let it pass to parent so it acts like normal!
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
      <div
        className={cn(
          "absolute -left-8 top-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] font-brand uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary text-muted-foreground print:hidden",
          isActive &&
            "opacity-100 bg-primary/20 text-primary shadow-[0_0_10px_rgba(99,102,241,0.2)]",
        )}
      >
        {block.type.replace("_", " ")}
      </div>

      {/* Drag Handle */}
      {isActive && (
        <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 active:opacity-100 cursor-grab active:cursor-grabbing text-zinc-400 dark:text-zinc-600 print:hidden transition-opacity">
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Scene Number */}
      {block.type === "scene_heading" && sceneNumber !== undefined && (
        <div className="absolute right-0 top-1.5 font-bold text-sm text-zinc-400 dark:text-zinc-500 print:text-black">
          {sceneNumber}
        </div>
      )}

      <TextareaAutosize
        ref={textareaRef}
        placeholder={
          block.type === "scene_heading"
            ? "INT. LOCATION - DAY"
            : block.type === "parenthetical"
              ? "(parenthetical)"
              : block.type
        }
        value={block.content}
        onChange={(e) => {
          onUpdate(block.id, e.target.value);
          setSelectedIndex(-1);
        }}
        onKeyDown={handleKeyDownWrapper}
        onFocus={onFocus}
        onBlur={handleBlur}
        className={cn(
          "resize-none outline-none bg-transparent placeholder:text-zinc-300 dark:placeholder:text-zinc-700 py-1 transition-all",
          "font-courier text-[16px] leading-[1.3] sm:text-[18px]",
          "print:hidden",
          getStylesForType(block.type),
        )}
        spellCheck={false}
      />

      <div
        className={cn(
          "hidden print:block whitespace-pre-wrap py-1 print:text-black",
          "font-courier text-[12pt] leading-[1.0]",
          block.type === "scene_heading" && "print-heading",
          block.type === "action" && "print-action",
          block.type === "character" && "print-character",
          block.type === "dialogue" && "print-dialogue",
          block.type === "parenthetical" && "print-parenthetical",
          block.type === "transition" && "print-transition",
          getStylesForType(block.type),
        )}
      >
        {block.content || "\u00A0"}
      </div>

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
