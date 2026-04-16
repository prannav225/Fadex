"use client";

import { Script, useScriptsStore } from "@/store/scripts";

interface TitlePageTabProps {
  scriptId: string;
}

export function TitlePageTab({ scriptId }: TitlePageTabProps) {
  const { scripts, updateScriptMetadata } = useScriptsStore();
  const script = scripts.find((s) => s.id === scriptId);

  if (!script) return null;

  const handleUpdate = (field: keyof Script, value: string) => {
    updateScriptMetadata(scriptId, { [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="font-brand text-[9px] uppercase tracking-[0.3em] text-[#136F63] mb-6 px-1 font-black">
        Title Page Info
      </h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[8px] font-brand uppercase tracking-[0.2em] text-black/30 font-black px-1">
            Main Title
          </label>
          <input
            type="text"
            value={script.title}
            onChange={(e) => handleUpdate("title", e.target.value)}
            placeholder="THE TITLE"
            className="w-full h-14 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-full px-6 text-sm font-sans font-bold tracking-widest focus:ring-4 focus:ring-[#136F63]/5 outline-none transition-all placeholder:text-black/10 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-brand uppercase tracking-[0.2em] text-black/30 font-black px-1">
            Written By
          </label>
          <input
            type="text"
            value={script.author || ""}
            onChange={(e) => handleUpdate("author", e.target.value)}
            placeholder="Author Name"
            className="w-full h-12 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-full px-5 text-xs font-sans font-medium focus:ring-4 focus:ring-[#136F63]/5 outline-none transition-all placeholder:text-black/10 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-brand uppercase tracking-[0.2em] text-black/30 font-black px-1">
            Based On
          </label>
          <textarea
            value={script.based_on || ""}
            onChange={(e) => handleUpdate("based_on", e.target.value)}
            placeholder="e.g. Based on the novel by..."
            className="w-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-xs font-sans font-medium min-h-[100px] focus:ring-4 focus:ring-[#136F63]/5 outline-none transition-all placeholder:text-black/10 resize-none shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-brand uppercase tracking-[0.2em] text-black/30 font-black px-1">
            Contact Info
          </label>
          <textarea
            value={script.contact_info || ""}
            onChange={(e) => handleUpdate("contact_info", e.target.value)}
            placeholder="Agent, Phone, Email..."
            className="w-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-xs font-sans font-medium min-h-[120px] focus:ring-4 focus:ring-[#136F63]/5 outline-none transition-all placeholder:text-black/10 resize-none shadow-sm"
          />
        </div>
      </div>

      <div className="pt-8 border-t border-black/5 mt-8 px-1">
        <p className="text-[10px] text-black/40 leading-relaxed italic font-medium">
          Note: Information on this page will be automatically formatted onto
          the title page during PDF export.
        </p>
      </div>
    </div>
  );
}
