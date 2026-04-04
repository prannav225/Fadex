"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor";

interface SearchTabProps {
  scriptId: string;
}

export function SearchTab({ scriptId }: SearchTabProps) {
  const { searchAndReplace } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchReplace = () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setTimeout(() => {
      searchAndReplace(scriptId, searchQuery, replaceQuery, caseSensitive);
      setIsSearching(false);
      setSearchQuery("");
      setReplaceQuery("");
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="font-brand text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-6 px-2">
        Search & Replace
      </h3>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[9px] font-brand uppercase tracking-[0.2em] text-[#136F63] font-black px-1">
            Find
          </label>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Character name, location..."
            className="bg-white border-black/5 rounded-full h-12 text-xs font-sans font-medium focus:ring-[#136F63]/10 placeholder:text-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-brand uppercase tracking-[0.2em] text-[#136F63] font-black px-1">
            Replace With
          </label>
          <Input
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="New value..."
            className="bg-white border-black/5 rounded-full h-12 text-xs font-sans font-medium focus:ring-[#136F63]/10 placeholder:text-zinc-300"
          />
        </div>

        <div className="flex items-center gap-3 px-1">
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={cn(
              "w-4 h-4 rounded border transition-all flex items-center justify-center",
              caseSensitive ? "bg-[#136F63] border-[#136F63]" : "border-zinc-300",
            )}
          >
            {caseSensitive && (
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </button>
          <span className="text-[10px] text-[#136F63] font-brand tracking-widest font-bold">
            CASE SENSITIVE
          </span>
        </div>

        <Button
          onClick={handleSearchReplace}
          disabled={!searchQuery || isSearching}
          className="w-full h-14 rounded-[2rem] bg-[#191919] hover:bg-[#136F63] text-white shadow-xl shadow-black/10 transition-all font-brand uppercase tracking-widest text-[10px] gap-3"
        >
          {isSearching ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            "REFRESH GLOBAL SCRIPT"
          )}
        </Button>

        <div className="px-2 pt-4 border-t border-black/5">
          <p className="text-[10px] text-zinc-400 italic leading-relaxed">
            Tip: Globally update character names or phrasing. Can be undone with
            Cmd+Z.
          </p>
        </div>
      </div>
    </div>
  );
}
