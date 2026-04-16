"use client";

import { useScriptsStore, Script } from "@/store/scripts";

interface InfoTabProps {
  scriptId: string;
}

export function InfoTab({ scriptId }: InfoTabProps) {
  const { scripts, updateScriptMetadata } = useScriptsStore();
  const script = scripts.find((s) => s.id === scriptId);

  if (!script) return null;

  const handleUpdate = (field: keyof Script, value: string) => {
    updateScriptMetadata(scriptId, { [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="font-brand text-[9px] uppercase tracking-[0.3em] text-[#136F63] mb-6 px-1 font-black">
        Story Intelligence
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[8px] font-brand uppercase tracking-[0.2em] text-black/30 font-black px-1">
            Logline
          </label>
          <textarea
            value={script.logline || ""}
            onChange={(e) => handleUpdate("logline", e.target.value)}
            placeholder="A short summary of your story..."
            className="w-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-xs font-sans font-medium min-h-[120px] focus:ring-4 focus:ring-[#136F63]/5 outline-none transition-all placeholder:text-black/10 resize-none shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-brand uppercase tracking-[0.2em] text-black/30 font-black px-1">
            Genre
          </label>
          <input
            type="text"
            value={script.genre || ""}
            onChange={(e) => handleUpdate("genre", e.target.value)}
            placeholder="e.g. Sci-Fi / Noir"
            className="w-full h-12 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-full px-5 text-xs font-sans font-medium focus:ring-4 focus:ring-[#136F63]/5 outline-none transition-all placeholder:text-black/10 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-brand uppercase tracking-[0.2em] text-black/30 font-black px-1">
            Draft Status
          </label>
          <input
            type="text"
            value={script.status || ""}
            onChange={(e) => handleUpdate("status", e.target.value)}
            placeholder="e.g. First Draft"
            className="w-full h-12 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-full px-5 text-xs font-sans font-medium focus:ring-4 focus:ring-[#136F63]/5 outline-none transition-all placeholder:text-black/10 shadow-sm"
          />
        </div>
      </div>

      <div className="pt-8 border-t border-black/5 mt-8">
        <p className="text-[10px] text-black/40 leading-relaxed italic px-1 font-medium">
          Structural metadata helps you track the evolution of your narrative beat by beat.
        </p>
      </div>
    </div>
  );
}
