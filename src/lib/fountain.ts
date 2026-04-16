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
  if (metadata.based_on)
    fountain += `Notes: ${metadata.based_on.replace(/\n/g, "\n       ")}\n`;
  if (metadata.status) fountain += `Draft date: ${metadata.status}\n`;
  if (metadata.contact_info)
    fountain += `Contact: ${metadata.contact_info.replace(/\n/g, "\n         ")}\n`;

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

export interface FountainImportModel {
  blocks: ScreenplayBlock[];
  metadata: {
    title?: string;
    author?: string;
    notes?: string;
    contact?: string;
    draft_date?: string;
  };
}

export const parseFountain = (text: string): FountainImportModel => {
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: ScreenplayBlock[] = [];
  const metadata: FountainImportModel["metadata"] = {};

  let i = 0;
  let parsingMetadata = true;
  let currentKey: string | null = null;

  console.group(
    "%c 🖋️ FADEX FOUNTAIN PARSER (V2.1) ",
    "background: #136F63; color: white; font-weight: bold; padding: 2px 5px; border-radius: 3px;",
  );

  // --- STEP 1: METADATA EXTRACTION (Standard Fountain compliant) ---
  while (i < lines.length && parsingMetadata) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line === "") {
      if (currentKey) {
        // Empty line AFTER metadata indicates start of body
        parsingMetadata = false;
        i++;
        break;
      } else {
        // Skip leading empty lines
        i++;
        continue;
      }
    }

    const match = rawLine.match(/^([\w\s]+):\s*(.*)$/i);
    if (match) {
      currentKey = match[1].trim().toLowerCase();
      const value = match[2].trim();

      switch (currentKey) {
        case "title": metadata.title = value; break;
        case "author":
        case "authors": metadata.author = value; break;
        case "notes":
        case "based on": metadata.notes = value; break;
        case "contact":
        case "contact info": metadata.contact = value; break;
        case "draft date":
        case "date": metadata.draft_date = value; break;
      }
    } else if (currentKey && (rawLine.startsWith(" ") || rawLine.startsWith("\t"))) {
      // Continuation line for the current metadata key
      const value = line;
      switch (currentKey) {
        case "title": metadata.title += "\n" + value; break;
        case "author":
        case "authors": metadata.author += "\n" + value; break;
        case "notes":
        case "based on": metadata.notes += "\n" + value; break;
        case "contact":
        case "contact info": metadata.contact += "\n" + value; break;
        case "draft date":
        case "date": metadata.draft_date += "\n" + value; break;
      }
    } else {
      // Line is not a Key: Value and not indented -> Start of body
      parsingMetadata = false;
    }

    if (parsingMetadata) i++;
  }

  // --- STEP 2: BODY PARSING ---
  let isInsideDialogue = false;

  for (; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      isInsideDialogue = false;
      continue;
    }

    // INDUSTRY HARDENING: Strip formatting tags before type detection
    // e.g. **INT. ROOM** should be detected as a scene heading
    const cleanLine = line.replace(/(\*\*|\*|_)/g, "");
    const upper = cleanLine.toUpperCase();

    let type: BlockType = "action";

    if (cleanLine.match(/^(INT\.|EXT\.|INT\/EXT\.|I\/E|EST\.)/i)) {
      type = "scene_heading";
      isInsideDialogue = false;
    } else if (upper === cleanLine && (cleanLine.endsWith(":") || cleanLine.startsWith("FADE "))) {
      type = "transition";
      isInsideDialogue = false;
    } else if (cleanLine.startsWith("(") && cleanLine.endsWith(")")) {
      type = "parenthetical";
    } else if (upper === cleanLine && cleanLine.length > 0 && cleanLine.length < 35 && !isInsideDialogue) {
      type = "character";
      isInsideDialogue = true;
    } else if (isInsideDialogue) {
      type = "dialogue";
    } else {
      type = "action";
      isInsideDialogue = false;
    }

    blocks.push({
      id: generateId(),
      type,
      content: line, // Store original line with formatting
    });
  }

  console.log("✅ PARSING COMPLETE. Total Blocks:", blocks.length);
  console.groupEnd();

  if (blocks.length === 0) {
    blocks.push({ id: generateId(), type: "action", content: "" });
  }

  return { blocks, metadata };
};
