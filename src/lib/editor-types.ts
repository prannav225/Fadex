export type BlockType =
  | "scene_heading"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "shot"
  | "montage"
  | "text_on_screen";

export interface ScreenplayBlock {
  id: string;
  type: BlockType;
  content: string;
}

export const BLOCK_TYPES: BlockType[] = [
  "scene_heading",
  "action",
  "character",
  "dialogue",
  "parenthetical",
  "transition",
  "shot",
  "montage",
  "text_on_screen",
];

export const getNextBlockType = (
  current: BlockType,
  reverse: boolean = false,
): BlockType => {
  const currentIndex = BLOCK_TYPES.indexOf(current);
  if (reverse) {
    return currentIndex > 0
      ? BLOCK_TYPES[currentIndex - 1]
      : BLOCK_TYPES[BLOCK_TYPES.length - 1];
  }
  return currentIndex < BLOCK_TYPES.length - 1
    ? BLOCK_TYPES[currentIndex + 1]
    : BLOCK_TYPES[0];
};

export const getSmartNextBlockType = (current: BlockType): BlockType => {
  // Logic for what block typically follows another when pressing Enter per spec
  switch (current) {
    case "scene_heading":
      return "action";
    case "character":
      return "dialogue";
    case "dialogue":
      return "dialogue"; // As per spec "DIALOGUE -> DIALOGUE"
    case "parenthetical":
      return "dialogue";
    case "transition":
      return "scene_heading";
    default:
      return "action";
  }
};

export const getTabNextBlockType = (
  current: BlockType,
  previousType?: BlockType,
): BlockType => {
  // Common sequence: Character -> Parenthetical -> Dialogue
  const hasCharacterContext = previousType === "character" || previousType === "parenthetical";

  switch (current) {
    case "action":
      return "character";
    case "character":
      return hasCharacterContext ? "parenthetical" : "transition";
    case "parenthetical":
      return "dialogue";
    case "dialogue":
      return "transition";
    case "transition":
      return "scene_heading";
    case "scene_heading":
      return "shot";
    case "shot":
      return "action";
    case "montage":
    case "text_on_screen":
      return "action";
    default:
      return "character";
  }
};

export const detectType = (content: string, currentType: BlockType): BlockType => {
  const trimmed = content.trim();
  const upper = trimmed.toUpperCase();

  // Pattern: Scene Headings
  if (upper.startsWith("INT.") || upper.startsWith("EXT.") || upper.startsWith("INT/EXT.") || upper.startsWith("EST.")) {
    return "scene_heading";
  }

  // Pattern: Transitions
  if (upper.endsWith("TO:") || upper === "FADE IN:" || upper === "FADE OUT:") {
    return "transition";
  }

  // Pattern: Parentheticals
  if (trimmed.startsWith("(") && currentType === "dialogue") {
    return "parenthetical";
  }

  // Pattern: Character (All caps, not a known keyword)
  // Only auto-switch to character if we were in action/transition
  if (trimmed.length > 0 && upper === trimmed && (currentType === "action" || currentType === "transition" || currentType === "dialogue")) {
     // Check if it looks like a scene heading/transition first
     if (!upper.startsWith("INT.") && !upper.startsWith("EXT.") && !upper.endsWith("TO:")) {
        return "character";
     }
  }

  return currentType;
};
