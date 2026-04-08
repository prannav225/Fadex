"use client";

import { useMemo } from "react";

interface SuggestionsRegistry {
  characters: string[];
  locations: string[];
  transitions: string[];
  shots: string[];
}

export function useBlockSuggestions(
  isActive: boolean,
  content: string,
  type: string,
  registry: SuggestionsRegistry,
) {
  return useMemo(() => {
    if (!isActive) return [];
    const contentToMatch = typeof content === "string" ? content : "";
    const lowerContent = contentToMatch.toLowerCase();

    if (type === "character") {
      if (!lowerContent) return [];
      return registry.characters.filter(
        (c) =>
          c.toLowerCase().includes(lowerContent) &&
          c.toLowerCase() !== lowerContent,
      );
    }

    if (type === "scene_heading") {
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

        const standardTimes = [
          "DAY",
          "NIGHT",
          "MORNING",
          "EVENING",
          "CONTINUOUS",
          "LATER",
        ];

        const allTimes = Array.from(
          new Set([...standardTimes, ...registry.transitions]), // We can reuse transitions or just standard
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

        const matchedLocs = registry.locations.filter(
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

    if (type === "transition") {
      const standardTransitions = [
        "CUT TO:",
        "FADE IN:",
        "FADE OUT.",
        "DISSOLVE TO:",
        "SMASH CUT TO:",
        "MATCH CUT TO:",
        "INTERCUT WITH:",
      ];

      const allTransitions = Array.from(
        new Set([...standardTransitions, ...registry.transitions]),
      );

      if (!lowerContent) return allTransitions;

      return allTransitions.filter(
        (t) =>
          t.toLowerCase().includes(lowerContent) &&
          t.toLowerCase() !== lowerContent,
      );
    }

    if (type === "shot") {
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

      const allShots = Array.from(
        new Set([...standardShots, ...registry.shots]),
      );

      if (!lowerContent) return allShots;

      return allShots.filter(
        (s) =>
          s.toLowerCase().includes(lowerContent) &&
          s.toLowerCase() !== lowerContent,
      );
    }

    return [];
  }, [isActive, content, type, registry]);
}
