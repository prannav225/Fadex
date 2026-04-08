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
        "z-40 shrink-0 overflow-y-auto overflow-x-hidden bg-background dark:bg-zinc-950/80 backdrop-blur-3xl border-r lg:border border-black/8 shadow-2xl transition-all duration-500 print:hidden",
        "fixed top-24 sm:top-28 left-2 w-[calc(94vw-16px)] max-w-[420px] h-fit lg:h-[calc(100vh-14rem)] max-h-[75vh] lg:max-h-none p-0 rounded-2xl lg:sticky lg:top-36 lg:w-80 lg:mr-10 lg:ml-10 lg:left-10",
        isNavOpen
          ? "translate-x-0 opacity-100 shadow-2xl ring-1 ring-black/5"
          : "-translate-x-[120%] lg:-translate-x-[150%] lg:w-0 lg:p-0 lg:m-0 opacity-0 pointer-events-none",
      )}
    >
      {/* Tabs Header */}
      <div className="sticky top-0 z-10 bg-white/60 rounded-t-lg backdrop-blur-md border-b border-black/5 p-2 px-3 flex items-center gap-1.5">
        {[
          { id: "scenes", icon: LayoutList, label: "OUTLINE" },
          { id: "search", icon: Search, label: "SEARCH" },
          { id: "info", icon: Info, label: "INFO" },
          { id: "title-page", icon: FileText, label: "TITLE" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all duration-300 relative font-brand text-[8px] tracking-[0.12em] font-black",
              activeTab === tab.id
                ? "bg-[#136F63] text-white shadow-lg shadow-[#136F63]/20"
                : "text-zinc-500 hover:text-[#136F63] hover:bg-[#136F63]/5",
            )}
          >
            <tab.icon
              className={cn(
                "w-3 h-3",
                activeTab === tab.id ? "opacity-100" : "opacity-40",
              )}
            />
            <span className="hidden sm:inline-block">{tab.label}</span>
          </button>
        ))}
        <button
          onClick={() => setIsNavOpen(false)}
          className="lg:hidden p-2 text-zinc-300 hover:text-red-500 transition-colors"
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
