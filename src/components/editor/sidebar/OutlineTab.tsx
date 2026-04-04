"use client";

import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { useEditorStore } from "@/store/editor";
import { useState } from "react";

interface OutlineTabProps {
  scriptId: string;
  scenesList: { id: string; num: number; content: string }[];
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
  setIsNavOpen: (open: boolean) => void;
}

export function OutlineTab({
  scriptId,
  scenesList,
  activeBlockId,
  setActiveBlockId,
  setIsNavOpen,
}: OutlineTabProps) {
  const { moveScene } = useEditorStore();
  const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);

  return (
    <div className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="font-brand text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-6 px-2">
        Outline View
      </h3>
      <div className="space-y-1">
        {scenesList.map((scene) => (
          <div
            key={scene.id}
            draggable
            onDragStart={(e) => {
              setDraggedSceneId(scene.id);
              e.dataTransfer.setData("sceneId", scene.id);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("sceneId");
              if (id && id !== scene.id) {
                moveScene(scriptId, id, scene.id);
              }
              setDraggedSceneId(null);
            }}
            className={cn(
              "group relative flex items-center gap-1 transition-all rounded-2xl",
              draggedSceneId === scene.id ? "opacity-30" : "opacity-100",
            )}
          >
            <div className="shrink-0 w-6 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-zinc-300 transition-opacity">
              <GripVertical className="w-3.5 h-3.5" />
            </div>
            <button
              onClick={() => {
                document.getElementById(`block-${scene.id}`)?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                setActiveBlockId(scene.id);
                if (window.innerWidth < 1024) setIsNavOpen(false);
              }}
              className={cn(
                "flex-1 text-left px-4 py-3 rounded-2xl text-[12px] transition-all border border-transparent",
                activeBlockId === scene.id
                  ? "bg-[#136F63] text-white font-bold shadow-xl shadow-[#136F63]/20 border-[#136F63]"
                  : "text-zinc-500 hover:bg-black/3 hover:border-black/5",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] mr-3",
                  activeBlockId === scene.id ? "text-zinc-200" : "text-zinc-700",
                )}
              >
                {scene.num.toString().padStart(2, "0")}
              </span>
              <span className="whitespace-normal leading-tight tracking-tight uppercase font-bold">
                {scene.content || "Untitled Scene"}
              </span>
            </button>
          </div>
        ))}

        {/* Drop target for end of list */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData("sceneId");
            if (id) moveScene(scriptId, id, null);
            setDraggedSceneId(null);
          }}
          className="h-12 w-full border-2 border-dashed border-transparent hover:border-black/5 hover:bg-black/1 rounded-2xl transition-all flex items-center justify-center"
        >
          <div className="w-1 h-1 rounded-full bg-zinc-200" />
        </div>
      </div>
      {scenesList.length === 0 && (
        <div className="text-[10px] uppercase tracking-widest text-zinc-300 px-2 py-12 text-center border-2 border-dashed border-black/3 rounded-[2rem] font-brand">
          No scenes detected
        </div>
      )}
    </div>
  );
}
