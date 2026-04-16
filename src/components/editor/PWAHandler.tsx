"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => console.log("FadeX Service Worker Registered"))
          .catch((err) => console.log("SW Registration failed: ", err));
      });
    }

    // Handle Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBtn(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  if (!showInstallBtn) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 hidden md:block">
      <button
        onClick={handleInstallClick}
        className="px-4 py-2 bg-[#136F63] text-white rounded-full font-brand text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform border border-white/20 backdrop-blur-md active:scale-95"
      >
        Install Fadex App
      </button>
    </div>
  );
}
