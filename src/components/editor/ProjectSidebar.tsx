"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  LayoutList,
  FileText,
  Info,
  Search,
} from "lucide-react";
import { OutlineTab } from "./sidebar/OutlineTab";
import { SearchTab } from "./sidebar/SearchTab";
import { InfoTab } from "./sidebar/InfoTab";
import { TitlePageTab } from "./sidebar/TitlePageTab";

interface ProjectSidebarProps {
  scriptId: string;
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  scenesList: { id: string; num: number; content: string }[];
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
}

type Tab = "scenes" | "search" | "info" | "title-page";

export function ProjectSidebar({
  scriptId,
  isNavOpen,
  setIsNavOpen,
  scenesList,
  activeBlockId,
  setActiveBlockId,
}: ProjectSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>("scenes");

  return (
    <div
      id="scene-navigator"
      className={cn(
        "z-40 shrink-0 overflow-y-auto overflow-x-hidden bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl border border-black/5 dark:border-white/5 transition-all duration-500 print:hidden shadow-2xl lg:shadow-none",
        "fixed top-[72px] lg:top-36 left-4 right-4 lg:left-10 lg:right-auto w-auto lg:w-80 h-[calc(100dvh-8rem)] lg:h-[calc(100vh-14rem)] p-0 rounded-[2.5rem] lg:sticky lg:mr-10",
        isNavOpen
          ? "translate-x-0 opacity-100"
          : "-translate-x-[120%] lg:-translate-x-[150%] lg:w-0 lg:p-0 lg:m-0 opacity-0 pointer-events-none",
      )}
    >
      {/* Immersive Tabs Header */}
      <div className="sticky top-0 z-10 bg-white/40 dark:bg-black/20 backdrop-blur-xl border-b border-black/5 dark:border-white/5 p-3 flex items-center gap-1.5">
        {[
          { id: "scenes", icon: LayoutList, label: "NAV" },
          { id: "search", icon: Search, label: "FIND" },
          { id: "info", icon: Info, label: "INFO" },
          { id: "title-page", icon: FileText, label: "TITLE" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as Tab);
              if (typeof window !== "undefined" && window.navigator.vibrate) window.navigator.vibrate(5);
            }}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1.5 py-3 transition-all duration-300 relative font-brand text-[7px] tracking-[0.15em] font-black group active:scale-95",
              activeTab === tab.id
                ? "text-[#136F63]"
                : "text-black/25 dark:text-white/20 hover:text-black/50",
            )}
          >
            <tab.icon
              className={cn(
                "w-4 h-4 mb-0.5 transition-transform duration-300 group-hover:scale-110",
                activeTab === tab.id ? "opacity-100" : "opacity-40",
              )}
            />
            <span className="truncate w-full text-center px-1 uppercase">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#136F63] rounded-full animate-in zoom-in duration-300" />
            )}
          </button>
        ))}
        <button
          onClick={() => setIsNavOpen(false)}
          className="lg:hidden p-3 text-black/20 hover:text-red-500 transition-colors ml-1 active:scale-75"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        {activeTab === "scenes" && (
          <OutlineTab
            scriptId={scriptId}
            scenesList={scenesList}
            activeBlockId={activeBlockId}
            setActiveBlockId={setActiveBlockId}
            setIsNavOpen={setIsNavOpen}
          />
        )}

        {activeTab === "search" && (
          <SearchTab scriptId={scriptId} />
        )}

        {activeTab === "info" && (
          <InfoTab scriptId={scriptId} />
        )}

        {activeTab === "title-page" && (
          <TitlePageTab scriptId={scriptId} />
        )}
      </div>
    </div>
  );
}
