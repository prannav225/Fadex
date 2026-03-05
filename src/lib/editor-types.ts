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
  // Logic for what block typically follows another when pressing Enter
  switch (current) {
    case "scene_heading":
      return "action";
    case "character":
      return "dialogue";
    case "dialogue":
      return "character";
    case "parenthetical":
      return "dialogue";
    case "transition":
      return "scene_heading";
    default:
      return "action";
  }
};
