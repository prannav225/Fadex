"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Plus,
  MoreVertical,
  FileText,
  Trash,
  Edit2,
  FileUp,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { parseFountain } from "@/lib/fountain";

import { useScriptsStore } from "@/store/scripts";
import { useEditorStore } from "@/store/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function Dashboard() {
  const router = useRouter();
  const {
    scripts,
    addScript,
    renameScript,
    deleteScript,
    updateScriptMetadata,
  } = useScriptsStore();
  const { deleteScriptData, setScriptBlocks } = useEditorStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [scriptToDelete, setScriptToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredScripts = scripts
    .filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      const id = addScript(newTitle.trim());
      setNewTitle("");
      setIsCreateOpen(false);
      router.push(`/editor/${id}`);
    }
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && activeScriptId) {
      renameScript(activeScriptId, newTitle.trim());
      setNewTitle("");
      setIsRenameOpen(false);
      setActiveScriptId(null);
    }
  };

  const openRenameDialog = (id: string, currentTitle: string) => {
    setActiveScriptId(id);
    setNewTitle(currentTitle);
    setIsRenameOpen(true);
  };

  const openDeleteDialog = (id: string, title: string) => {
    setScriptToDelete({ id, title });
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (scriptToDelete) {
      deleteScript(scriptToDelete.id);
      deleteScriptData(scriptToDelete.id);
      setIsDeleteOpen(false);
      setScriptToDelete(null);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const inputElement = e.target;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const { blocks, metadata } = parseFountain(text);
        const finalTitle =
          metadata.title || file.name.replace(/\.fountain$/i, "");
        const newId = addScript(finalTitle);
        setScriptBlocks(newId, blocks);

        if (Object.keys(metadata).length > 0) {
          updateScriptMetadata(newId, {
            author: metadata.author,
            contact_info: metadata.contact,
            based_on: metadata.notes,
            status: metadata.draft_date || "Imported Draft",
          });
        }
        inputElement.value = "";
        router.push(`/editor/${newId}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9] text-[#191919] relative selection:bg-[#136F63]/10 overflow-x-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-[#136F63]/5 rounded-full blur-[140px] animate-pulse"
          style={{ animationDuration: "12s" }}
        />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4C3A3]/20 rounded-full blur-[120px]" />
      </div>

      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 lg:px-12",
          isScrolled || searchQuery
            ? "py-3 lg:py-4 bg-white/80 backdrop-blur-2xl border-b border-black/5"
            : "py-4 lg:py-8 bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <h1
            onClick={() => router.push("/")}
            className="font-brand uppercase tracking-[0.3em] text-lg lg:text-2xl font-black cursor-pointer group shrink-0"
          >
            FADEX<span className="text-[#136F63]">.</span>
          </h1>

          <div className="flex items-center gap-4 shrink-0 ml-auto w-full max-w-sm lg:max-w-md">
            <div className="flex items-center bg-black/5 rounded-full px-4 py-2 border border-black/5 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#136F63]/5 focus-within:border-[#136F63]/20 transition-all w-full group shadow-sm">
              <Search className="w-3.5 h-3.5 text-black/20 group-focus-within:text-[#136F63] transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-xs w-full px-2 placeholder:text-black/25 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors active:scale-75"
                >
                  <X className="w-3 h-3 text-black/30" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 lg:pt-48 pb-32 lg:pb-20 px-4 lg:px-12 max-w-5xl mx-auto flex-1 w-full">
        <header className="mb-10 lg:mb-14">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center lg:text-left">
            <div className="space-y-3">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <span className="text-[9px] text-black/30 font-brand uppercase tracking-[0.25em] font-black">
                  {scripts.length} Projects In Studio
                </span>
              </div>
              <h2 className="font-display font-black text-4xl lg:text-7xl tracking-tighter leading-[0.9] lg:leading-[0.85]">
                The Drafting <br />
                <span className="text-[#136F63] italic">Suite.</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="file"
                id="fountain-import-dash"
                accept=".fountain"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById("fountain-import-dash")?.click()
                }
                className="rounded-full border-black/10 bg-white/50 backdrop-blur-md px-6 h-12 tracking-[0.15em] font-brand text-[9px] uppercase hover:bg-white hover:border-[#136F63] hover:text-[#136F63] transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <FileUp className="w-3.5 h-3.5 mr-2 opacity-60" />
                Import
              </Button>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="rounded-full bg-[#136F63] hover:bg-[#191919] text-white px-10 h-14 tracking-[0.2em] font-brand text-[10px] uppercase shadow-2xl shadow-[#136F63]/20 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </header>

        {scripts.length === 0 ? (
          <div className="group relative flex flex-col items-center justify-center py-24 lg:py-40 text-center rounded-[3rem] bg-white border border-black/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="w-20 h-20 mb-8 relative">
              <div className="absolute inset-0 bg-[#136F63]/5 rounded-3xl border border-black/5 rotate-12" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-8 h-8 text-[#136F63]/30" />
              </div>
            </div>
            <h3 className="text-xl lg:text-2xl font-display font-black tracking-tight mb-3">
              No stories found.
            </h3>
            <p className="text-black/40 text-xs max-w-[240px] mx-auto mb-10 leading-relaxed font-medium">
              Your creative vault is empty. Start a new script or import a
              Fountain file.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-full bg-[#191919] hover:bg-[#136F63] text-white px-12 py-6 h-auto tracking-widest font-brand text-[10px] uppercase active:scale-95 shadow-xl"
            >
              Begin Journey
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {filteredScripts.map((script, i) => (
              <div
                key={script.id}
                onClick={() => router.push(`/editor/${script.id}`)}
                className="group flex items-center justify-between p-4 lg:p-5 bg-white border border-black/5 hover:border-[#136F63]/20 rounded-[2rem] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] transition-all cursor-pointer active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#FDFCF9] rounded-2xl flex items-center justify-center border border-black/[0.03] group-hover:bg-[#136F63]/5 transition-colors">
                    <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-black/10 group-hover:text-[#136F63]/40" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-black text-sm lg:text-base text-black truncate group-hover:text-[#136F63] transition-colors leading-tight mb-1">
                      {script.title}
                    </h4>
                    <p className="text-[8px] text-black/30 font-brand uppercase tracking-[0.1em] font-bold">
                      {format(new Date(script.updated_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-full hover:bg-black/5 active:scale-75 transition-all"
                      >
                        <MoreVertical className="w-4 h-4 text-black/20" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-2xl border-black/5 p-1.5 shadow-2xl min-w-[140px]"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          openRenameDialog(script.id, script.title)
                        }
                        className="rounded-xl gap-3 px-4 py-3 cursor-pointer focus:bg-[#136F63] focus:text-white group/item"
                      >
                        <Edit2 className="w-3.5 h-3.5 opacity-50" />
                        <span className="font-brand text-[9px] uppercase tracking-widest font-black">
                          Rename
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          openDeleteDialog(script.id, script.title)
                        }
                        className="rounded-xl gap-3 px-4 py-3 cursor-pointer text-red-600 focus:bg-red-500 focus:text-white group/del"
                      >
                        <Trash className="w-3.5 h-3.5 opacity-50" />
                        <span className="font-brand text-[9px] uppercase tracking-widest font-black">
                          Delete
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-8 right-8 z-50 lg:hidden">
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="w-16 h-16 rounded-full bg-[#136F63] text-white shadow-2xl shadow-[#136F63]/50 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      {/* NEW SCRIPT MODAL - RESTORED PREMIUM STYLES WITH CORRECT SPACING */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-[3rem] p-8 lg:p-16 border-none shadow-2xl bg-[#FDFCF9] max-w-lg w-[92vw] overflow-hidden sm:w-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#136F63]/5 rounded-full blur-3xl -mr-16 -mt-16" />

          <DialogHeader className="items-center text-center relative z-10 pt-4">
            <div className="w-16 h-16 bg-[#136F63]/10 rounded-2xl flex items-center justify-center mb-6 rotate-12">
              <Sparkles className="w-8 h-8 text-[#136F63]" />
            </div>
            <DialogTitle className="text-2xl lg:text-4xl font-display font-black tracking-tight mb-2 uppercase">
              New{" "}
              <span className="text-[#136F63] italic font-serif lowercase tracking-normal">
                Script.
              </span>
            </DialogTitle>
            <DialogDescription className="text-black/40 font-medium text-[10px] lg:text-xs">
              Every masterpiece begins with a single word.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="mt-8 relative z-10">
            <Input
              placeholder="e.g. THE FINAL FRONTIER"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-16 rounded-3xl bg-black/5 border-none px-6 text-lg focus-visible:ring-4 focus-visible:ring-[#136F63]/5 focus-visible:bg-white transition-all font-display font-black placeholder:text-black/10 uppercase tracking-tight"
              autoFocus
            />
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="flex-1 rounded-full h-14 font-brand text-[9px] uppercase tracking-widest text-black/60 border-black/10 bg-transparent hover:bg-black hover:text-white hover:border-black active:scale-95 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newTitle.trim()}
                className="flex-[2] rounded-full bg-[#136F63] hover:bg-[#191919] text-[#FDFCF9] h-14 font-brand text-[10px] tracking-[0.2em] font-black shadow-xl shadow-[#136F63]/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                Begin Writing
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="rounded-[3rem] p-10 lg:p-14 border-none shadow-2xl bg-[#FDFCF9] w-[92vw] sm:w-full">
          <DialogHeader className="items-center text-center pt-4">
            <div className="w-14 h-14 bg-[#136F63]/5 rounded-2xl flex items-center justify-center mb-6">
              <Edit2 className="w-6 h-6 text-[#136F63]" />
            </div>
            <DialogTitle className="text-2xl font-display font-black tracking-tight mb-2 uppercase">
              Update{" "}
              <span className="text-[#136F63] italic font-serif lowercase tracking-normal">
                Identity.
              </span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit} className="mt-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-14 rounded-2xl bg-black/5 border-none px-6 text-base focus-visible:ring-4 focus-visible:ring-[#136F63]/5 focus-visible:bg-white transition-all font-medium active:scale-[0.98]"
              autoFocus
            />
            <DialogFooter className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRenameOpen(false)}
                className="flex-1 rounded-full h-14 font-brand text-[9px] uppercase tracking-widest text-black/60 border-black/10 bg-transparent hover:bg-black hover:text-white hover:border-black active:scale-95 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newTitle.trim()}
                className="flex-[2] rounded-full bg-[#136F63] hover:bg-[#136F63]/90 text-white h-14 font-brand text-[10px] uppercase tracking-widest shadow-xl shadow-[#136F63]/20 transition-all active:scale-95"
              >
                Rename Script
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 bg-[#FDFCF9] w-[92vw] sm:w-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20" />
          <DialogHeader className="items-center text-center pt-4">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
              <Trash className="w-7 h-7 text-red-500" />
            </div>
            <DialogTitle className="text-2xl font-display font-black tracking-tight uppercase">
              Move to{" "}
              <span className="text-red-500 italic font-serif lowercase tracking-normal">
                Trash?
              </span>
            </DialogTitle>
            <DialogDescription className="text-black/40 text-xs mt-4 px-6 leading-relaxed font-medium">
              Are you sure you want to delete{" "}
              <span className="text-black font-bold">
                &quot;{scriptToDelete?.title}&quot;
              </span>
              ? This action is permanent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 rounded-full h-12 font-brand text-[9px] uppercase tracking-widest text-black/60 border-black/15 bg-white hover:bg-black hover:text-white transition-all duration-300 active:scale-95"
            >
              Keep Script
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white h-12 font-brand text-[10px] uppercase tracking-widest shadow-xl shadow-red-200 transition-all active:scale-95"
            >
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="relative z-10 border-t border-black/5 bg-white/30 backdrop-blur-md py-8 lg:py-12 px-6 lg:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <h1 className="font-brand uppercase tracking-[0.2em] text-xl font-black">
              FADEX<span className="text-[#136F63]">.</span>
            </h1>
            <p className="text-[9px] font-brand uppercase tracking-widest text-black/30">
              Created with structural precision.
            </p>
          </div>
          <p className="text-[10px] font-brand uppercase tracking-widest text-black/20">
            © 2026 FADEX STUDIO
          </p>
        </div>
      </footer>
    </div>
  );
}
