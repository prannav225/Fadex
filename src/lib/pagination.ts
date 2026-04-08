import { ScreenplayBlock, BlockType } from "./editor-types";

export interface PaginatedBlock extends ScreenplayBlock {
  indexInFullList: number;
  sceneNumber?: number;
}

export type BlockGroupType = "character_group" | "scene_group" | "single" | "flow";

export interface BlockGroup {
  type: BlockGroupType;
  blocks: PaginatedBlock[];
  weight: number;
}

export type PageData = PaginatedBlock[];

const MAX_LINES_PER_PAGE = 45;

/**
 * Calculates the total weight (height in lines) for a block
 */
function calculateBlockWeight(block: ScreenplayBlock): number {
  const content = block.content || "";
  switch (block.type) {
    case "scene_heading": return 1 + 2.5; // Text + mt-8/mb-4 gaps
    case "action": return Math.max(1, Math.ceil(content.length / 60)) + 2.0;
    case "character": return 1 + 1.0; // Text + mt-4 gap
    case "parenthetical": return Math.max(1, Math.ceil(content.length / 25));
    case "dialogue": return Math.max(1, Math.ceil(content.length / 33)) + 1.0; // Text + mb-4 gap
    case "transition": 
    case "shot":
    case "montage":
    case "text_on_screen":
      return 1 + 3.0;
    default: return 1;
  }
}

/**
 * Stage 1: Convert flat blocks into context-aware groups
 */
export function buildGroups(blocks: ScreenplayBlock[], strict: boolean = true): BlockGroup[] {
  const groups: BlockGroup[] = [];
  let i = 0;
  let sceneCounter = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    
    // CHARACTER GROUP DETECTOR (Atomic in Strict Mode)
    if (block.type === "character" && strict) {
      const groupBlocks: PaginatedBlock[] = [{ ...block, indexInFullList: i }];
      i++;
      
      if (blocks[i]?.type === "parenthetical") {
        groupBlocks.push({ ...blocks[i], indexInFullList: i });
        i++;
      }
      
      while (blocks[i]?.type === "dialogue") {
        groupBlocks.push({ ...blocks[i], indexInFullList: i });
        i++;
      }
      
      groups.push({
        type: "character_group",
        blocks: groupBlocks,
        weight: groupBlocks.reduce((acc, b) => acc + calculateBlockWeight(b), 0)
      });
      continue;
    }

    // SCENE GROUP DETECTOR (Atomic in Strict Mode)
    if (block.type === "scene_heading") {
      sceneCounter++;
      const groupBlocks: PaginatedBlock[] = [{ ...block, indexInFullList: i, sceneNumber: sceneCounter }];
      i++;
      
      const flowTypes: BlockType[] = ["action", "shot", "montage", "text_on_screen"];
      // In strict mode, scene heading + first action are glued
      if (strict && blocks[i] && flowTypes.includes(blocks[i].type)) {
        groupBlocks.push({ ...blocks[i], indexInFullList: i });
        i++;
      }
      
      groups.push({
        type: "scene_group",
        blocks: groupBlocks,
        weight: groupBlocks.reduce((acc, b) => acc + calculateBlockWeight(b), 0)
      });
      continue;
    }

    // SINGLE OR FLOW BLOCKS
    const weight = calculateBlockWeight(block);
    groups.push({
      type: block.type === "action" || block.type === "montage" ? "flow" : "single",
      blocks: [{ ...block, indexInFullList: i }],
      weight
    });
    i++;
  }

  return groups;
}

/**
 * Stage 2: Distribute groups across physical pages
 */
export function paginateBlocks(blocks: ScreenplayBlock[], strict: boolean = true): PageData[] {
  if (!blocks || blocks.length === 0) return [[]];
  
  const groups = buildGroups(blocks, strict);
  const pages: PageData[] = [];
  let currentPage: PageData = [];
  let currentLines = 0;
  
  // Relaxed limit for mobile to allow slight overflow and prevent jumpy typing
  const pageLimit = strict ? MAX_LINES_PER_PAGE : 52; 

  groups.forEach((group) => {
    // Check if the group exceeds the remaining page height
    if (currentLines + group.weight > pageLimit && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [...group.blocks];
      currentLines = group.weight;
    } else {
      currentPage.push(...group.blocks);
      currentLines += group.weight;
    }
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : [[]];
}
