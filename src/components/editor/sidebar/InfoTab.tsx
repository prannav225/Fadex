"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Script, useScriptsStore } from "@/store/scripts";
import { useEditorStore } from "@/store/editor";
import { Input } from "@/components/ui/input";

interface InfoTabProps {
  scriptId: string;
}

export function InfoTab({ scriptId }: InfoTabProps) {
  const { scripts, updateScriptMetadata } = useScriptsStore();
  const { scripts: editorScripts } = useEditorStore();

  const script = scripts.find((s) => s.id === scriptId);

  // Stats calculation
  const stats = useMemo(() => {
    let totalLinesCount = 0;
    const charMap: Record<string, number> = {};

    const currentBlocks = editorScripts[scriptId]?.blocks || [];

    currentBlocks.forEach((block, index) => {
      // Estimate vertical line space
      if (block.type === "scene_heading") totalLinesCount += 3;
      else if (block.type === "character") totalLinesCount += 1.5;
      else if (block.type === "parenthetical") totalLinesCount += 1;
      else if (block.type === "dialogue") {
        const lines = Math.ceil((block.content?.length || 0) / 35);
        totalLinesCount += Math.max(1, lines);

        // Character line attribution
        let i = index - 1;
        while (i >= 0 && currentBlocks[i].type === "parenthetical") i--;
        if (i >= 0 && currentBlocks[i].type === "character") {
          const name = currentBlocks[i].content?.trim().toUpperCase();
          if (name) charMap[name] = (charMap[name] || 0) + 1;
        }
      } else if (block.type === "action") {
        const lines = Math.ceil((block.content?.length || 0) / 60);
        totalLinesCount += Math.max(1, lines) + 0.5;
      } else {
        totalLinesCount += 1;
      }
    });

    const pageCount = Math.max(1, Math.ceil(totalLinesCount / 54));
    const characters = Object.entries(charMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, lines]) => ({ name, lines }));

    return { pageCount, characters };
  }, [editorScripts, scriptId]);

  if (!script) return null;

  const handleUpdate = (field: keyof Script, value: string) => {
    updateScriptMetadata(scriptId, { [field]: value });
  };

  return (
    <div className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="font-brand text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-6 px-2">
        Project Details
      </h3>
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[9px] font-brand uppercase tracking-[0.2em] text-[#136F63] font-black px-1">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {["First Draft", "Polished", "Final Draft", "Production"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => handleUpdate("status", s)}
                  className={cn(
                    "px-4 py-2 text-[9px] font-brand uppercase font-medium tracking-wide rounded-full border transition-all",
                    script.status === s
                      ? "bg-[#136F63] text-white border-[#136F63] shadow-lg shadow-[#136F63]/20"
                      : "bg-white border-black/5 text-zinc-400 hover:border-[#136F63]/30",
                  )}
                >
                  {s}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-brand uppercase tracking-[0.2em] text-[#136F63] font-black px-1">
            Genre
          </label>
          <Input
            value={script.genre || ""}
            onChange={(e) => handleUpdate("genre", e.target.value)}
            placeholder="e.g. Neo-Noir Sci-Fi"
            className="bg-white border-black/5 rounded-full h-12 text-xs font-sans font-medium focus:ring-[#136F63]/10 placeholder:text-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-brand uppercase tracking-[0.2em] text-[#136F63] font-black px-1">
            Logline
          </label>
          <textarea
            value={script.logline || ""}
            onChange={(e) => handleUpdate("logline", e.target.value)}
            placeholder="In a world where..."
            className="w-full bg-white border border-black/5 rounded-[2rem] p-5 text-[13px] font-sans font-medium min-h-[160px] focus:ring-4 focus:ring-[#136F63]/5 outline-none transition-all placeholder:text-zinc-300 leading-relaxed resize-none shadow-sm"
          />
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-black/5 space-y-8">
        <h3 className="font-brand text-[9px] uppercase tracking-[0.3em] text-zinc-400 px-2">
          Production Stats
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#136F63]/5 border border-[#136F63]/10 rounded-2xl p-5 text-center">
            <div className="text-[10px] font-brand uppercase tracking-widest text-[#136F63] mb-1">
              Runtime
            </div>
            <div className="text-xl font-bold font-display">
              {stats.pageCount}{" "}
              <span className="text-[10px] font-normal text-zinc-400">Min</span>
            </div>
          </div>
          <div className="bg-[#136F63]/5 border border-[#136F63]/10 rounded-2xl p-5 text-center">
            <div className="text-[10px] font-brand uppercase tracking-widest text-[#136F63] mb-1">
              Length
            </div>
            <div className="text-xl font-bold font-display">
              {stats.pageCount}{" "}
              <span className="text-[10px] font-normal text-zinc-400">Pgs</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[9px] font-brand uppercase tracking-[0.2em] text-[#136F63] font-black">
              Character Log
            </label>
            <span className="text-[9px] text-zinc-400 font-mono">
              {stats.characters.length} Roles
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {stats.characters.map((char) => (
              <div
                key={char.name}
                className="flex items-center justify-between bg-white border border-black/5 rounded-xl px-4 py-3 group hover:border-[#136F63]/20 transition-all"
              >
                <span className="text-[11px] font-bold font-display tracking-wide uppercase text-zinc-700">
                  {char.name}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#136F63]/40 rounded-full"
                      style={{
                        width: `${Math.min(100, (char.lines / (stats.characters[0]?.lines || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">
                    {char.lines}
                  </span>
                </div>
              </div>
            ))}
            {stats.characters.length === 0 && (
              <p className="text-[10px] text-center text-zinc-300 py-4 font-brand uppercase tracking-widest">
                No dialogue detected
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
