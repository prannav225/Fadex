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

const MAX_LINES_PER_PAGE = 40; // Conservative limit for 12pt @ 1.2 (~8.0 inches of text)

/**
 * Calculates the total weight (height in lines) for a block
 * Based on 12pt Courier @ 1.2 line-height (~5 lines per inch)
 */
function calculateBlockWeight(block: ScreenplayBlock, isFirstOnPage: boolean = false): number {
  const content = block.content || "";
  
  // Defensive wrapping: standard Courier is 10 chars per inch. 
  // We use slightly smaller widths to account for long words/punctuation.
  const wrappingWidths: Record<BlockType, number> = {
    scene_heading: 60,
    action: 60,
    character: 38,
    parenthetical: 24,
    dialogue: 33,
    transition: 60,
    shot: 60,
    montage: 60,
    text_on_screen: 33
  };

  const width = wrappingWidths[block.type] || 60;
  const textLines = Math.max(1, Math.ceil(content.length / width));
  
  // Margins in lines (12pt = 1 line)
  // Industry standard: First block on page starts at 1 inch (no top margin)
  if (isFirstOnPage) return textLines;

  switch (block.type) {
    case "scene_heading":
    case "transition":
    case "shot":
    case "montage":
      return textLines + 2.0; // mt-24pt
    case "action":
    case "character":
    case "text_on_screen":
      return textLines + 1.0; // mt-12pt
    case "parenthetical":
    case "dialogue":
      return textLines; // No margin (following character/parenthetical)
    default:
      return textLines;
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
    // Character + Parenthetical + Dialogue are kept together
    if (block.type === "character" && strict) {
      const groupBlocks: PaginatedBlock[] = [{ ...block, indexInFullList: i }];
      i++;
      
      // Look ahead for parenthetical/dialogue
      while (i < blocks.length && (blocks[i].type === "parenthetical" || blocks[i].type === "dialogue")) {
        groupBlocks.push({ ...blocks[i], indexInFullList: i });
        i++;
      }
      
      groups.push({
        type: "character_group",
        blocks: groupBlocks,
        // Calculate weight with margins by default
        weight: groupBlocks.reduce((acc, b) => acc + calculateBlockWeight(b, false), 0)
      });
      continue;
    }

    // SCENE GROUP DETECTOR (Atomic in Strict Mode)
    // Scene Heading + at least one Action block kept together
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
        // Calculate weight with margins by default
        weight: groupBlocks.reduce((acc, b) => acc + calculateBlockWeight(b, false), 0)
      });
      continue;
    }

    // SINGLE OR FLOW BLOCKS
    const weight = calculateBlockWeight(block, false);
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
  
  const pageLimit = strict ? MAX_LINES_PER_PAGE : 50; 
  
  // MINIMUM BUFFER LINES FOR DIFFERENT ELEMENTS
  const MIN_LINES_FOR_HEADING = 6;    // Heading + 2-3 lines of content
  const MIN_LINES_FOR_CHARACTER = 4;  // Character name + 2 lines of dialogue
  const MIN_LINES_FOR_ACTION = 3;     // At least 2 lines of action

  groups.forEach((group) => {
    // Re-calculate group weight assuming it MIGHT be at the top of a new page
    const weightAtTopOfPage = group.blocks.reduce((acc, b, idx) => 
      acc + calculateBlockWeight(b, idx === 0), 0);
    
    const remainingLines = pageLimit - currentLines;
    
    // SCENARIO DETECTION
    const isHeading = group.type === "scene_group" || 
                     group.blocks.some(b => b.type === "shot" || b.type === "montage");
    const isCharacter = group.type === "character_group";
    const isTransition = group.blocks.some(b => b.type === "transition");
    const isAction = group.type === "flow";

    // ORPHAN & CONTINUITY LOGIC
    let forceNewPage = false;

    if (currentPage.length > 0) {
      if (isHeading && remainingLines < MIN_LINES_FOR_HEADING) {
        // Don't start a scene/shot/montage if we can't fit the head and some body
        forceNewPage = true;
      } else if (isCharacter && remainingLines < MIN_LINES_FOR_CHARACTER) {
        // Don't start a character name if we can't fit at least 2 lines of dialogue
        forceNewPage = true;
      } else if (isTransition) {
        // Transitions should NEVER be at the top of a page unless it's the very first block of the script (FADE IN)
        // If it's a transition and it's forced to the next page because it doesn't fit, 
        // it's actually better to pull the previous block with it, but for now,
        // we just ensure it doesn't orphan itself if possible.
        const content = group.blocks[0].content.toUpperCase();
        const isFadeIn = content.includes("FADE IN");
        
        if (!isFadeIn && currentLines + group.weight > pageLimit) {
           forceNewPage = true;
        }
      } else if (isAction && remainingLines < MIN_LINES_FOR_ACTION && group.weight >= MIN_LINES_FOR_ACTION) {
        // If it's a substantial action block, don't leave a tiny sliver at the bottom
        forceNewPage = true;
      } else if (currentLines + group.weight > pageLimit) {
        // Standard overflow
        forceNewPage = true;
      }
    }

    if (forceNewPage) {
      pages.push(currentPage);
      currentPage = [...group.blocks];
      currentLines = weightAtTopOfPage;
    } else {
      // If it's the first group on the first page, use top-of-page weight
      const weightToAdd = currentPage.length === 0 ? weightAtTopOfPage : group.weight;
      currentPage.push(...group.blocks);
      currentLines += weightToAdd;
    }
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : [[]];
}
