"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Plus, MoreVertical, FileText, Trash, Edit2 } from "lucide-react";

import { useScriptsStore } from "@/store/scripts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [scriptToDelete, setScriptToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addScript(newTitle.trim());
      setNewTitle("");
      setIsCreateOpen(false);
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
      setIsDeleteOpen(false);
      setScriptToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-8 transition-all duration-500">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-8 lg:mb-12 gap-6 sm:gap-0">
          <div className="relative group text-center sm:text-left">
            <h1 className="font-brand uppercase tracking-[0.2em] text-4xl lg:text-5xl font-extrabold text-foreground drop-shadow-[0_0_15px_rgba(19,111,99,0.1)]">
              FADEX
            </h1>
            <p className="text-muted-foreground mt-2 font-display text-xs lg:text-sm tracking-wide">
              Manage your screenplays and projects.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="w-full sm:w-auto gap-2 bg-[#136F63] text-[#F3EFE0] hover:bg-[#136F63]/90 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-full px-6 lg:px-8 py-5 lg:py-6 shadow-lg shadow-[#136F63]/20 font-brand tracking-widest uppercase text-xs lg:text-sm"
          >
            <Plus className="w-4 h-4" />
            New Script
          </Button>
        </header>

        {scripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 lg:p-20 text-center border border-border/50 rounded-[2rem] lg:rounded-[3rem] bg-white/40 backdrop-blur-xl shadow-sm">
            <div className="w-16 h-16 lg:w-20 lg:h-20 mb-6 rounded-3xl bg-[#136F63]/5 flex items-center justify-center">
              <FileText className="w-8 h-8 lg:w-10 lg:h-10 text-[#136F63]/40" />
            </div>
            <h2 className="text-xl lg:text-2xl font-brand uppercase tracking-widest text-[#191919] mb-3">
              No Scripts
            </h2>
            <p className="text-muted-foreground mb-8 lg:mb-10 max-w-xs lg:max-w-sm text-xs lg:text-sm font-display tracking-tight leading-relaxed">
              Your cinematic workspace is empty. Start a new journey by creating
              your first screenplay.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="w-full sm:w-auto bg-[#136F63] text-[#F3EFE0] rounded-full px-8 lg:px-12 py-5 lg:py-7 h-auto text-xs lg:text-sm font-brand tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#136F63]/10 transition-all font-bold"
            >
              Start Writing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scripts.map((script) => (
              <Card
                key={script.id}
                className="group relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border/50 shadow-sm hover:shadow-[0_20px_60px_-15px_rgba(19,111,99,0.1)] hover:-translate-y-1.5 hover:border-[#136F63]/40 transition-all duration-500 cursor-pointer"
                onClick={() => router.push(`/editor/${script.id}`)}
              >
                <div className="aspect-[16/10] sm:aspect-[4/3] bg-background/50 flex items-center justify-center relative border-b border-border/10 overflow-hidden">
                  <div className="absolute inset-0 opacity-5 flex flex-col gap-2 p-4">
                    <div className="h-1 w-2/3 bg-[#191919] rounded-full" />
                    <div className="h-1 w-full bg-[#191919] rounded-full" />
                    <div className="h-1 w-1/2 bg-[#191919] rounded-full ml-auto" />
                  </div>
                  <FileText className="w-8 h-8 lg:w-10 lg:h-10 text-[#136F63]/20 transition-transform group-hover:scale-110 group-hover:text-[#136F63]/40 z-10" />
                  <div
                    className="absolute top-3 right-3 lg:top-4 lg:right-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 lg:w-9 lg:h-9 text-[#191919] rounded-full bg-background/40 hover:bg-white backdrop-blur-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-2xl border-border/50 backdrop-blur-xl"
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            openRenameDialog(script.id, script.title)
                          }
                          className="rounded-xl px-4 py-2 text-sm"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 rounded-xl px-4 py-2 text-sm"
                          onClick={() =>
                            openDeleteDialog(script.id, script.title)
                          }
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-6 lg:p-8">
                  <h3 className="font-display font-bold text-base lg:text-lg text-[#191919] truncate pb-1 group-hover:text-[#136F63] transition-colors leading-tight">
                    {script.title}
                  </h3>
                  <p className="text-[9px] lg:text-[10px] font-brand tracking-widest text-muted-foreground uppercase opacity-60 mt-1">
                    Edited {format(new Date(script.updated_at), "MMM d, yyyy")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Script</DialogTitle>
              <DialogDescription className="sr-only">
                Enter a title for your new script.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <Input
                  id="title"
                  placeholder="Enter script title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Rename Dialog */}
        <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Script</DialogTitle>
              <DialogDescription className="sr-only">
                Enter a new title for your script.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRenameSubmit}>
              <div className="grid gap-4 py-4">
                <Input
                  id="rename-title"
                  placeholder="Enter new title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRenameOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="max-w-[400px] rounded-[2rem] border-none shadow-2xl">
            <DialogHeader className="flex flex-col items-center text-center pt-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash className="w-8 h-8 text-red-500" />
              </div>
              <DialogTitle className="text-xl font-brand uppercase tracking-widest text-[#191919]">
                Move to Trash?
              </DialogTitle>
              <DialogDescription className="text-sm font-display text-muted-foreground mt-2 px-4 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="text-[#191919] font-bold italic">
                  &quot;{scriptToDelete?.title}&quot;
                </span>
                ? This action is permanent and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center gap-2 mt-4 pb-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-full px-8 font-brand uppercase tracking-widest text-xs hover:bg-zinc-100"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white hover:bg-red-700 rounded-full px-8 font-brand uppercase tracking-widest text-xs shadow-lg shadow-red-200"
              >
                Delete Forever
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
