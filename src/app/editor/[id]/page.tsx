"use client";

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, FileDown } from "lucide-react";

import { useScriptsStore } from "@/store/scripts";
import { useEditorStore } from "@/store/editor";
import { Editor } from "@/components/editor/Editor";
import { Button } from "@/components/ui/button";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  // Extract params in Next.js 15+ App Router
  const { id } = use(params);

  // We should ideally fetch the script title here. Since we're using Zustand,
  // we do this securely client-side. We can create a small header wrapper.

  return (
    <div className="bg-background min-h-screen font-sans flex flex-col print:bg-white print:text-black">
      <header className="fixed top-4 lg:top-8 left-1/2 -translate-x-1/2 w-[95%] lg:w-[90%] max-w-[900px] p-2 lg:p-3 rounded-2xl lg:rounded-[2rem] bg-background/40 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center justify-between z-50 print:hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(19,111,99,0.08)]">
        <div className="flex items-center gap-1 lg:gap-2 pl-1 lg:pl-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-xl lg:rounded-2xl hover:bg-primary/10 hover:text-primary transition-all shrink-0"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            </Link>
          </Button>
          <div className="h-5 lg:h-6 w-px bg-border mx-1 shrink-0" />
          <div className="min-w-0 flex-1">
            <ScriptTitle id={id} />
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-4 pr-1 lg:pr-2 shrink-0">
          <div className="hidden sm:block">
            <AutoSaveIndicator scriptId={id} />
          </div>
          <Button
            variant="default"
            size="sm"
            className="gap-2 bg-primary text-primary-foreground rounded-xl lg:rounded-2xl px-3 lg:px-5 py-1.5 lg:py-2 text-xs lg:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            onClick={() => window.print()}
          >
            <FileDown className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden xs:inline">Export</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto w-full print:p-0 print:bg-white print:overflow-visible my-print-container">
        <Editor scriptId={id} />
      </main>
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

function ScriptTitle({ id }: { id: string }) {
  const { scripts } = useScriptsStore();
  const script = scripts.find((s) => s.id === id);

  if (!script) {
    return <span className="text-zinc-500 font-medium">Unknown Script</span>;
  }

  return (
    <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
      {script.title}
    </span>
  );
}
