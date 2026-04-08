export const BLOCK_STYLES: Record<string, string> = {
  scene_heading: "uppercase font-bold w-full mt-8 mb-4 tracking-normal",
  action: "w-full mt-4 mb-4",
  character:
    "uppercase w-full sm:w-auto mt-4 mb-0 sm:pl-[22ch] sm:text-left text-center font-normal",
  dialogue:
    "w-full sm:w-[33ch] mt-0 mb-4 sm:ml-[10ch] text-center sm:text-left mx-auto sm:mx-0",
  parenthetical:
    "mt-0 mb-0 sm:ml-[16ch] sm:w-[25ch] text-center sm:text-left mx-auto sm:mx-0",
  transition: "uppercase text-right w-full mt-8 mb-4",
  shot: "uppercase font-bold w-full mt-8 mb-4",
  montage:
    "uppercase font-bold w-full text-zinc-600 dark:text-zinc-400 mt-8 mb-4",
  text_on_screen:
    "italic w-full sm:w-[33ch] mt-4 mb-4 sm:ml-[10ch] text-center sm:text-left mx-auto sm:mx-0",
};

export function getStylesForType(type: string) {
  return BLOCK_STYLES[type] || "w-full";
}
