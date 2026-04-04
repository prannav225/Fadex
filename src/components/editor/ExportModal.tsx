"use client";

import { useState } from "react";
import {
  Loader2,
  FileText,
  Download,
  FileJson,
  CheckCircle2,
} from "lucide-react";
import { useEditorStore } from "@/store/editor";
import { generateFountain } from "@/lib/fountain";
import { useScriptsStore } from "@/store/scripts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  scriptId: string;
  scriptTitle?: string;
}

export function ExportModal({
  isOpen,
  onOpenChange,
  scriptId,
  scriptTitle = "Untitled",
}: ExportModalProps) {
  const { scripts: editorScripts } = useEditorStore();
  const { scripts: dashboardScripts } = useScriptsStore();
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const scriptState = editorScripts[scriptId];
  const metadata = dashboardScripts.find((s) => s.id === scriptId);

  if (!scriptState) return null;

  const handleExportPDF = async () => {
    console.log("Preparing PDF Export...", {
      scriptTitle,
      HasScriptState: !!scriptState,
      BlocksLength: scriptState?.blocks?.length,
    });

    if (
      !scriptState ||
      !scriptState.blocks ||
      scriptState.blocks.length === 0
    ) {
      console.error("Export aborted: No script state or blocks found.");
      return;
    }

    setIsPreparing(true);

    // Smooth transition to print
    setTimeout(() => {
      console.log("Triggering window.print()");
      window.print();
      setIsPreparing(false);
      setIsSuccess(true);

      // Auto close after success feedback
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
      }, 2000);
    }, 1000);
  };

  const handleExportFountain = () => {
    console.log("Preparing Fountain Export...", {
      scriptTitle,
      HasScriptState: !!scriptState,
      BlocksLength: scriptState?.blocks?.length,
    });

    if (
      !scriptState ||
      !scriptState.blocks ||
      scriptState.blocks.length === 0
    ) {
      console.error("Export aborted: No script state or blocks found.");
      return;
    }

    const fountainText = generateFountain(scriptState.blocks, {
      title: metadata?.title || scriptTitle || "Untitled",
      author: metadata?.author,
      based_on: metadata?.based_on,
      contact_info: metadata?.contact_info,
      status: metadata?.status,
    });
    console.log("Generated Fountain Text Length:", fountainText.length);
    const blob = new Blob([fountainText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(scriptTitle || "Untitled").replace(/\s+/g, "_")}.fountain`;

    // Physical DOM attachment for browser compatibility
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    setIsSuccess(true);

    setTimeout(() => {
      onOpenChange(false);
      setIsSuccess(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="mb-6">
          <DialogTitle className="font-brand uppercase tracking-[0.2em] text-lg font-black text-[#191919]">
            Export Project
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-display text-xs tracking-tight leading-relaxed">
            Generate your screenplay in professional PDF format or
            industry-standard Fountain data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-4 relative">
          {/* Export PDF Button */}
          <Button
            onClick={handleExportPDF}
            disabled={isPreparing || isSuccess}
            className={`group relative w-full h-16 rounded-full transition-all duration-500 shadow-xl flex items-center justify-between px-6 border-none overflow-hidden
              ${
                isSuccess
                  ? "bg-green-600 text-white"
                  : "bg-[#191919] text-white hover:bg-[#136f63] hover:scale-[1.02] active:scale-[0.98]"
              }`}
          >
            <div className="flex items-center gap-4 relative z-10">
              <div
                className={`p-2 rounded-xl transition-colors duration-500 ${isSuccess ? "bg-white/20" : "bg-white/10"}`}
              >
                {isPreparing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div className="text-left">
                <span className="block font-brand uppercase tracking-widest text-[10px] opacity-70">
                  {isPreparing
                    ? "Preparing Canvas..."
                    : isSuccess
                      ? "Generated"
                      : "Document"}
                </span>
                <span className="block font-display font-bold text-sm tracking-tight">
                  {isPreparing
                    ? "Formatting Script..."
                    : isSuccess
                      ? "PDF Export Ready"
                      : "Save as Professional PDF"}
                </span>
              </div>
            </div>
            {!isPreparing && !isSuccess && (
              <Download className="w-5 h-5 opacity-40 group-hover:translate-y-0.5 transition-transform" />
            )}
          </Button>

          {/* Export Fountain Button */}
          <Button
            onClick={handleExportFountain}
            disabled={isPreparing}
            className="group relative w-full h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[#191919] dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm flex items-center justify-between px-6 border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#191919] dark:bg-zinc-900 rounded-xl">
                <FileJson className="w-5 h-5 text-white/70" />
              </div>
              <div className="text-left">
                <span className="block font-brand uppercase tracking-widest text-[10px] opacity-50">
                  Data
                </span>
                <span className="block font-display font-bold text-sm tracking-tight text-[#191919] dark:text-zinc-100">
                  Download .Fountain
                </span>
              </div>
            </div>
            <Download className="w-5 h-5 opacity-30 group-hover:translate-y-0.5 transition-transform" />
          </Button>

          {isPreparing && (
            <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20 animate-in fade-in">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
              <p className="text-[10px] font-brand uppercase tracking-widest text-primary font-black">
                Aligning to Industry Standard
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
