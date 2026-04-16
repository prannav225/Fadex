export const BLOCK_STYLES: Record<string, string> = {
  scene_heading: "uppercase font-bold w-full mt-[24pt] mb-0 tracking-normal",
  action: "w-full mt-[12pt] mb-0",
  character:
    "uppercase w-full mt-[12pt] mb-0 ml-[2.0in] sm:ml-[2.0in] text-left font-normal max-w-[4.0in]",
  dialogue:
    "w-full mt-0 mb-0 ml-[1.0in] sm:ml-[1.0in] text-left max-w-[3.5in]",
  parenthetical:
    "mt-0 mb-0 ml-[1.5in] sm:ml-[1.5in] text-left max-w-[2.5in]",
  transition: "uppercase text-right w-full mt-[24pt] mb-0",
  shot: "uppercase font-bold w-full mt-[24pt] mb-0",
  montage:
    "uppercase font-bold w-full text-zinc-600 dark:text-zinc-400 mt-[24pt] mb-0",
  text_on_screen:
    "italic w-full mt-[12pt] mb-0 ml-[1.0in] sm:ml-[1.0in] text-left max-w-[3.5in]",
};

export function getStylesForType(type: string) {
  return BLOCK_STYLES[type] || "w-full";
}
