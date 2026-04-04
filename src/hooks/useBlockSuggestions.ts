"use client";

import { useMemo } from "react";
import { ScreenplayBlock } from "@/lib/editor-types";

export function useBlockSuggestions(
  isActive: boolean,
  block: ScreenplayBlock,
  allBlocks: ScreenplayBlock[],
) {
  return useMemo(() => {
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
          .map((b) => b.content.toUpperCase()),
      );
      return Array.from(characters).filter(
        (c) =>
          typeof c === "string" &&
          c.toLowerCase().includes(lowerContent) &&
          c.toLowerCase() !== lowerContent,
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
}
