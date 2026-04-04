import React from "react";

/**
 * Parses and renders Fountain/Markdown-style formatting (Bold, Italic, Underline).
 * Supports:
 * **bold** -> <strong>
 * *italic* -> <em>
 * _underline_ -> <u>
 */
export function renderFountainText(text: string) {
  if (!text) return "\u00A0";

  // Regex to split by formatting tokens while keeping them in the result
  // Matches **bold**, *italic*, and _underline_
  const regex = /(\*\*.*?\*\*|\*.*?\*|_.*?_)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("_") && part.endsWith("_")) {
      return (
        <u key={i} className="underline">
          {part.slice(1, -1)}
        </u>
      );
    }
    return part;
  });
}
