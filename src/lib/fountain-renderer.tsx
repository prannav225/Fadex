import React from "react";

/**
 * Parses and renders Fountain/Markdown-style formatting (Bold, Italic, Underline).
 * Supports:
 * **bold** -> <strong>
 * *italic* -> <em>
 * _underline_ -> <u>
 */
export function renderFountainText(text: string): React.ReactNode {
  if (!text) return "\u00A0";

  // Regex to split by formatting tokens while keeping them in the result
  // Matches **bold**, *italic*, and _underline_
  const regex = /(\*\*.*?\*\*|\*.*?\*|_.*?_)/g;
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold">
          {renderFountainText(part.slice(2, -2))}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic">
          {renderFountainText(part.slice(1, -1))}
        </em>
      );
    }
    if (part.startsWith("_") && part.endsWith("_")) {
      return (
        <u key={i} className="underline">
          {renderFountainText(part.slice(1, -1))}
        </u>
      );
    }
    return part;
  });
}
