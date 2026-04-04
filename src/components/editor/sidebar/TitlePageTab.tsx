"use client";

import { Script, useScriptsStore } from "@/store/scripts";
import { Input } from "@/components/ui/input";

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
    <div className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="font-brand text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-6 px-2">
        Title Page Info
      </h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[9px] font-brand uppercase tracking-[0.2em] text-[#136F63] font-black px-1">
            Main Title
          </label>
          <Input
            value={script.title}
            onChange={(e) => handleUpdate("title", e.target.value)}
            placeholder="THE TITLE"
            className="bg-white border-black/10 rounded-full h-14 text-sm font-sans font-bold tracking-widest focus:ring-[#136F63]/10 placeholder:text-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-brand uppercase tracking-[0.2em] text-[#136F63] font-black px-1">
            Written By
          </label>
          <Input
            value={script.author || ""}
            onChange={(e) => handleUpdate("author", e.target.value)}
            placeholder="Author Name"
            className="bg-white border-black/5 rounded-full h-12 text-xs font-sans font-medium focus:ring-[#136F63]/10 placeholder:text-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-brand uppercase tracking-[0.2em] text-[#136F63] font-black px-1">
            Based On
          </label>
          <textarea
            value={script.based_on || ""}
            onChange={(e) => handleUpdate("based_on", e.target.value)}
            placeholder="e.g. Based on the novel by..."
            className="w-full bg-white border border-black/5 rounded-[2rem] p-4 text-xs font-sans font-medium min-h-[100px] focus:ring-4 focus:ring-[#136F63]/5 outline-none transition-all placeholder:text-zinc-300 resize-none shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-brand uppercase tracking-[0.2em] text-[#136F63] font-black px-1">
            Contact Info
          </label>
          <textarea
            value={script.contact_info || ""}
            onChange={(e) => handleUpdate("contact_info", e.target.value)}
            placeholder="Agent, Phone, Email..."
            className="w-full bg-white border border-black/5 rounded-[2rem] p-4 text-xs font-sans font-medium min-h-[120px] focus:ring-4 focus:ring-[#136F63]/5 outline-none transition-all placeholder:text-zinc-300 resize-none shadow-sm"
          />
        </div>
      </div>

      <div className="pt-6 px-2">
        <p className="text-[10px] text-zinc-700 leading-relaxed italic border-t border-black/5 pt-6">
          Note: Information on this page will be automatically formatted onto
          the title page during PDF export.
        </p>
      </div>
    </div>
  );
}
