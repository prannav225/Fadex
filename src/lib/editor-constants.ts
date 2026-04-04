export const BLOCK_STYLES: Record<string, string> = {
  scene_heading:
    "uppercase font-bold w-full text-foreground/90 mt-5 sm:mt-8 mb-2 sm:mb-4 tracking-wide text-xs sm:text-base drop-shadow-sm border-l-2 sm:border-l-4 border-primary/40 pl-3 sm:pl-4",
  action:
    "w-full text-foreground/80 mt-1.5 sm:mt-2 mb-1.5 sm:mb-2 leading-relaxed",
  character:
    "uppercase w-full text-center sm:w-fit sm:mx-auto sm:min-w-[40%] text-primary font-bold mt-4 sm:mt-6 tracking-wide",
  dialogue:
    "w-[92%] mx-auto sm:w-[65%] sm:mx-0 sm:ml-[15%] text-black dark:text-zinc-200",
  parenthetical:
    "italic text-center w-[85%] mx-auto sm:w-[50%] sm:mx-0 sm:ml-[25%] sm:text-left text-black dark:text-zinc-200 mt-1 mb-1",
  transition:
    "uppercase text-right w-full text-black dark:text-white mt-3 sm:mt-4",
  shot: "uppercase font-bold w-full text-black dark:text-white mt-3 sm:mt-4",
  montage:
    "uppercase font-bold w-full text-zinc-600 dark:text-zinc-400 mt-3 sm:mt-4",
  text_on_screen:
    "italic w-[92%] mx-auto sm:w-[65%] sm:mx-0 sm:ml-[15%] text-black dark:text-zinc-200",
};

export function getStylesForType(type: string) {
  return BLOCK_STYLES[type] || "w-full";
}
