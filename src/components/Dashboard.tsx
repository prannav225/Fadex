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
  ChevronRight,
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
  const { scripts, addScript, renameScript, deleteScript } = useScriptsStore();
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

    // Reset the input value immediately so the same file can be picked again,
    // and to prevent browsers from attempting to restore the filename value 
    // during navigation, which triggers the InvalidStateError.
    const inputElement = e.target;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const title = file.name.replace(/\.fountain$/i, "");
        const blocks = parseFountain(text);
        const newId = addScript(title);
        setScriptBlocks(newId, blocks);
        
        // Final reset for safety before navigation
        inputElement.value = "";
        
        router.push(`/editor/${newId}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9] text-[#191919] relative selection:bg-[#136F63]/10">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-[#136F63]/5 rounded-full blur-[140px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4C3A3]/20 rounded-full blur-[120px]" />
      </div>

      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 lg:px-12",
          isScrolled
            ? "py-2 lg:py-4 bg-white/70 backdrop-blur-xl border-b border-black/10"
            : "py-4 lg:py-8 bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-0">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <h1
              onClick={() => router.push("/")}
              className="font-brand uppercase tracking-[0.2em] text-xl lg:text-2xl font-black cursor-pointer group"
            >
              FADEX
              <span className="text-[#136F63] group-hover:animate-pulse">
                .
              </span>
            </h1>
          </div>

          <div className="flex items-center w-full">
            <div className="flex items-center bg-black/5 rounded-full px-4 py-2 lg:py-3 border border-black/15 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#136F63]/10 focus-within:border-[#136F63]/30 transition-all w-full group">
              <Search className="w-4 h-4 text-black/30 group-focus-within:text-[#136F63] transition-colors" />
              <input
                type="text"
                placeholder="Search your scripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-sm w-full px-3 placeholder:text-black/30"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 lg:pt-44 pb-20 px-6 lg:px-12 max-w-5xl mx-auto flex-1 w-full">
        <header className="mb-10 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-[#136F63]/10 text-[#136F63] rounded-full text-[9px] font-brand uppercase tracking-widest font-black">
                  Studio Dashboard
                </span>
                <div className="h-px w-8 bg-black/10 hidden sm:block" />
                <span className="text-[10px] text-black/40 font-brand uppercase tracking-widest">
                  {scripts.length} Project{scripts.length !== 1 ? "s" : ""}
                </span>
              </div>
              <h2 className="font-display font-black text-3xl lg:text-5xl tracking-tight leading-tight lg:leading-none">
                Your Cinematic <br />
                <span className="text-[#136F63] italic">Collection.</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 lg:gap-6 lg:mb-4">
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
                className="rounded-full border-black/15 bg-white px-5 lg:px-8 h-12 lg:h-14 tracking-widest lg:tracking-[0.2em] font-brand text-[9px] lg:text-[10px] uppercase hover:bg-[#136F63] hover:text-white hover:border-[#136F63] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <FileUp className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                Import
              </Button>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="rounded-full bg-[#136F63] hover:bg-[#136F63]/90 text-white px-6 lg:px-10 h-12 lg:h-14 tracking-widest lg:tracking-[0.2em] font-brand text-[9px] lg:text-[10px] uppercase shadow-xl lg:shadow-2xl shadow-[#136F63]/30 cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                New Script
              </Button>
            </div>
          </div>
        </header>

        {scripts.length === 0 ? (
          <div className="group relative flex flex-col items-center justify-center py-32 lg:py-52 text-center rounded-[3rem] bg-white border border-black/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-[radial-gradient(circle_at_50%_120%,rgba(19,111,99,0.03),transparent)]" />

            <div className="w-24 h-24 mb-10 relative">
              <div className="absolute inset-0 bg-[#136F63]/5 rounded-[2.5rem] border border-black/10 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
              <div className="absolute inset-0 bg-[#136F63]/10 rounded-[2.5rem] border border-black/10 -rotate-6 group-hover:rotate-12 transition-transform duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-10 h-10 text-[#136F63]/40 group-hover:text-[#136F63] transition-colors" />
              </div>
            </div>

            <h3 className="text-2xl lg:text-3xl font-display font-black tracking-tight mb-4">
              The silence is{" "}
              <span className="text-[#136F63] italic font-serif">waiting.</span>
            </h3>
            <p className="text-black/60 text-sm max-w-xs mx-auto mb-10 leading-relaxed font-medium">
              Your creative repository is empty. Create a script or import a
              Fountain file to begin.
            </p>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-full bg-[#191919] hover:bg-[#136F63] text-white px-12 py-7 h-auto tracking-widest font-brand text-[11px] uppercase group transition-all cursor-pointer shadow-xl hover:shadow-[#136F63]/20"
            >
              Initialize Project
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 lg:gap-4">
            {searchQuery && filteredScripts.length === 0 ? (
              <div className="py-24 text-center rounded-[3rem] bg-white border border-black/5">
                <Search className="w-12 h-12 text-[#136F63]/20 mx-auto mb-4" />
                <h3 className="text-xl font-display font-black tracking-tight mb-2">
                  No matching scripts
                </h3>
                <p className="text-black/40 text-xs font-brand uppercase tracking-widest mb-6">
                  Found nothing for &quot;{searchQuery}&quot;
                </p>
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="rounded-full border-black/10 text-[9px] font-brand uppercase tracking-widest px-8"
                >
                  Show all projects
                </Button>
              </div>
            ) : (
              filteredScripts.map((script, i) => (
                <div
                  key={script.id}
                  onClick={() => router.push(`/editor/${script.id}`)}
                  className="group flex items-center justify-between p-4 lg:p-6 bg-white border border-black/5 hover:border-[#136F63]/20 rounded-2xl lg:rounded-[2rem] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] transition-all cursor-pointer animate-in fade-in slide-in-from-left-2"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-center gap-4 lg:gap-8 min-w-0">
                    <div className="w-10 h-10 lg:w-16 lg:h-16 bg-[#F9F9F7] group-hover:bg-[#136F63]/5 rounded-xl lg:rounded-3xl flex items-center justify-center transition-colors">
                      <FileText className="w-5 h-5 lg:w-8 lg:h-8 text-black/20 group-hover:text-[#136F63]/60" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display font-black text-sm lg:text-xl text-black truncate group-hover:text-[#136F63] transition-colors leading-tight lg:mb-1">
                        {script.title}
                      </h4>
                      <p className="text-[8px] lg:text-[10px] text-black/40 font-brand uppercase tracking-widest font-bold">
                        LAST EDITED ·{" "}
                        {format(new Date(script.updated_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block">
                      <span className="text-[10px] text-[#136F63] font-brand uppercase tracking-tighter font-black opacity-0 group-hover:opacity-100 transition-opacity">
                        Enter Editor
                      </span>
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
                            className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl hover:bg-black/5"
                          >
                            <MoreVertical className="w-4 h-4 text-black/30" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-2xl border-black/5 p-1.5 shadow-2xl"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              openRenameDialog(script.id, script.title)
                            }
                            className="rounded-xl gap-3 px-4 py-3 cursor-pointer focus:bg-[#136F63] focus:text-white group/item"
                          >
                            <Edit2 className="w-4 h-4 text-black/30 group-focus/item:text-white" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              openDeleteDialog(script.id, script.title)
                            }
                            className="rounded-xl gap-3 px-4 py-3 cursor-pointer text-red-600 focus:bg-red-500 focus:text-white group/del"
                          >
                            <Trash className="w-4 h-4 text-red-400 group-focus/del:text-white" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-[3rem] p-10 lg:p-14 border-none shadow-[0_50px_100px_-50px_rgba(0,0,0,0.5)] bg-[#F3F1EA] max-w-xl">
          <DialogHeader className="items-center text-center relative">
            <div className="w-20 h-20 bg-[#136F63]/10 rounded-full flex items-center justify-center mb-8">
              <Sparkles className="w-10 h-10 text-[#136F63]" />
            </div>
            <DialogTitle className="text-3xl lg:text-4xl font-display font-black tracking-tight mb-2">
              New{" "}
              <span className="text-[#136F63] italic font-serif">Journey.</span>
            </DialogTitle>
            <DialogDescription className="text-black/50 font-medium">
              Give your cinematic project a name to get started.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="mt-6">
            <Input
              placeholder="The Greatest Story Never Told..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-16 rounded-2xl bg-black/5 border-none px-6 text-lg focus-visible:ring-2 focus-visible:ring-[#136F63]/10 focus-visible:bg-white transition-all font-medium placeholder:text-black/20"
              autoFocus
            />
            <DialogFooter className="mt-10 sm:justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full px-10 h-14 font-brand text-[10px] uppercase tracking-widest text-[#191919] border-black/15 bg-white hover:bg-black hover:text-white transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newTitle.trim()}
                className="rounded-full bg-[#136F63] hover:bg-[#191919] text-[#F3EFE0] px-12 h-16 font-brand text-sm tracking-[0.2em] font-black shadow-2xl shadow-[#136F63]/30 transition-all hover:scale-[1.05] active:scale-[0.98] cursor-pointer z-9999"
              >
                Begin Writing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="rounded-[3rem] p-10 lg:p-14 border-none shadow-2xl">
          <DialogHeader className="items-center text-center">
            <div className="w-20 h-20 bg-[#136F63]/5 rounded-[2.5rem] flex items-center justify-center mb-8">
              <Edit2 className="w-8 h-8 text-[#136F63]" />
            </div>
            <DialogTitle className="text-3xl font-display font-black tracking-tight mb-2">
              Update <span className="text-[#136F63] italic">Identity.</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit} className="mt-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-16 rounded-2xl bg-black/5 border-none px-6 text-lg focus-visible:ring-0 focus-visible:bg-black/10 transition-all font-medium"
              autoFocus
            />
            <DialogFooter className="mt-10 sm:justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRenameOpen(false)}
                className="rounded-full px-10 h-14 font-brand text-[10px] uppercase tracking-widest text-[#191919] border-black/15 bg-white hover:bg-black hover:text-white transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newTitle.trim()}
                className="rounded-full bg-[#136F63] hover:bg-[#136F63]/90 text-white px-12 h-14 font-brand text-[10px] uppercase tracking-widest shadow-xl shadow-[#136F63]/20 transition-all"
              >
                Rename Script
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="rounded- border-none shadow-2xl p-10">
          <DialogHeader className="items-center text-center">
            <div className="w-20 h-20 bg-red-50 rounded-[2.5rem] flex items-center justify-center mb-6">
              <Trash className="w-10 h-10 text-red-500" />
            </div>
            <DialogTitle className="text-3xl font-display font-black tracking-tight">
              Move to <span className="text-red-500 italic">Trash?</span>
            </DialogTitle>
            <DialogDescription className="text-black/40 text-sm mt-4 px-6 leading-relaxed font-medium">
              Are you sure you want to delete{" "}
              <span className="text-black font-bold">
                &quot;{scriptToDelete?.title}&quot;
              </span>
              ? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-10 sm:justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-full px-10 h-14 font-brand text-[10px] uppercase tracking-widest text-[#191919] border-black/15 bg-white hover:bg-black hover:text-white transition-all duration-300"
            >
              Keep Script
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white px-12 h-14 font-brand text-[10px] uppercase tracking-widest shadow-xl shadow-red-200 transition-all"
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
