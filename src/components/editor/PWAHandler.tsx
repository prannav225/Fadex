"use client";

import { useEffect, useState } from "react";

export function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
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
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
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
        className="px-4 py-2 bg-[#136F63] text-white rounded-full font-brand text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform border border-white/20 backdrop-blur-md"
      >
        Install Fadex App
      </button>
    </div>
  );
}
