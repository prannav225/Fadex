"use client";

import { use, useEffect, useState, useRef } from "react";

import { useScriptsStore } from "@/store/scripts";
import { useEditorStore } from "@/store/editor";
import { Editor } from "@/components/editor/Editor";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  // Extract params in Next.js 15+ App Router
  const { id } = use(params);

  return (
    <div className="bg-white dark:bg-zinc-900 sm:bg-background min-h-screen font-sans print:bg-white print:text-black">
      <Editor scriptId={id} />
      <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
        <AutoSaveIndicator scriptId={id} />
      </div>
    </div>
  );
}

function AutoSaveIndicator({ scriptId }: { scriptId: string }) {
  const { scripts } = useEditorStore();
  const { touchScript } = useScriptsStore();
  const blocks = scripts[scriptId]?.blocks;

  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (!blocks) return;

    const startTimer = setTimeout(() => {
      setStatus("saving");
    }, 0);

    const timer = setTimeout(() => {
      touchScript(scriptId); // Update timestamp
      setStatus("saved");

      // Hide the saved message after 2 seconds
      setTimeout(() => setStatus("idle"), 2000);
    }, 1000); // 1s debounce

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [blocks, scriptId, touchScript]);

  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 animate-in fade-in">
      {status === "saving" ? (
        <>
          <Save className="w-3.5 h-3.5 animate-pulse" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
        </>
      )}
    </div>
  );
}

import { Save, CheckCircle2 } from "lucide-react";
