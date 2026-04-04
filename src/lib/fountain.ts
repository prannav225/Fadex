import { ScreenplayBlock, BlockType } from "./editor-types";

/**
 * Generates a .fountain string from an array of ScreenplayBlocks.
 */
export const generateFountain = (
  blocks: ScreenplayBlock[],
  metadata: {
    title: string;
    author?: string;
    based_on?: string;
    contact_info?: string;
    status?: string;
  },
): string => {
  let fountain = "";

  if (metadata.title) fountain += `Title: ${metadata.title.toUpperCase()}\n`;
  if (metadata.author) fountain += `Author: ${metadata.author}\n`;
  if (metadata.based_on) fountain += `Notes: ${metadata.based_on.replace(/\n/g, "\n       ")}\n`;
  if (metadata.status) fountain += `Draft date: ${metadata.status}\n`;
  if (metadata.contact_info) fountain += `Contact: ${metadata.contact_info.replace(/\n/g, "\n         ")}\n`;

  if (fountain) fountain += "\n\n";

  const body = blocks
    .map((block) => {
      const content = block.content?.trim();
      if (!content) return "";

      switch (block.type) {
        case "scene_heading":
          return `\n${content.toUpperCase()}`;
        case "character":
          return `\n${content.toUpperCase()}`;
        case "dialogue":
          return content;
        case "parenthetical":
          return content.startsWith("(") ? content : `(${content})`;
        case "transition":
          return `\n${content.toUpperCase()}`;
        case "action":
        case "shot":
        case "montage":
        case "text_on_screen":
        default:
          return `\n${content}`;
      }
    })
    .filter(Boolean)
    .join("\n");

  return fountain + body;
};

/**
 * Parses a .fountain string into an array of ScreenplayBlocks.
 * This is a hardened, industry-standard parser for Fadex.
 */
import { generateId } from "./uuid";

export const parseFountain = (text: string): ScreenplayBlock[] => {
  // Step 1: Normalize & Split (Preserving empty lines for structural context)
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: ScreenplayBlock[] = [];
  
  // Step 4: Handle Context (CRITICAL for distinguishing Action vs. Dialogue)
  let isInsideDialogue = false;

  console.group("%c 🖋️ FADEX FOUNTAIN PARSER DEBUG ", "background: #136F63; color: white; font-weight: bold; padding: 2px 5px; border-radius: 3px;");
  console.log("Input Normalized: Splitting into", lines.length, "lines.");

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Step 5: Handle Empty Lines Properly (Break dialogue blocks & reset context)
    if (!line) {
      if (isInsideDialogue) {
        console.log(`[LINE ${i}] BLANK -> %cRESET DIALOGUE CONTEXT`, "color: #136F63; font-style: italic;");
      }
      isInsideDialogue = false;
      continue;
    }

    let type: BlockType = "action";

    // 1. Scene Heading: Starts with specific location markers
    if (line.match(/^(INT\.|EXT\.|INT\/EXT\.|I\/E|EST\.)/i)) {
      type = "scene_heading";
      isInsideDialogue = false;
    } 
    // 2. Transition: All caps and ends with colon
    else if (line === line.toUpperCase() && (line.endsWith(":") || line.startsWith("FADE "))) {
      type = "transition";
      isInsideDialogue = false;
    }
    // 3. Parenthetical: Wrapped in parentheses
    else if (line.startsWith("(") && line.endsWith(")")) {
      type = "parenthetical";
      // context remains dialogue
    }
    // 4. Character: ALL CAPS + short length + NOT inside dialogue yet
    else if (line === line.toUpperCase() && line.length < 35 && !isInsideDialogue) {
      type = "character";
      isInsideDialogue = true; // Lock context for following lines
    }
    // 5. Dialogue: Captured if we are locked in dialogue context
    else if (isInsideDialogue) {
      type = "dialogue";
    }
    // 6. Action: Fallback for all other text
    else {
      type = "action";
      isInsideDialogue = false;
    }

    // Step 2 & 7: Debug Logging & Validation
    console.log(`[LINE ${i}] "${line.substring(0, 40)}${line.length > 40 ? "..." : ""}" %c-> ${type.toUpperCase()}`, "color: #136F63; font-weight: bold;");

    blocks.push({
      id: generateId(),
      type,
      content: line,
    });
  }

  console.log("✅ PARSING COMPLETE. Total Blocks:", blocks.length);
  console.groupEnd();

  // Ensure we don't return an empty project (Step 7)
  if (blocks.length === 0) {
    return [{ id: generateId(), type: "action", content: "" }];
  }

  return blocks;
};
