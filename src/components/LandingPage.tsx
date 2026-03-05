"use client";

import React from "react";
import { ArrowRight, Box, CloudOff, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#F3EFE0] text-[#191919] font-sans selection:bg-[#136F63]/20 overflow-x-hidden lg:overflow-hidden flex flex-col relative transition-all duration-500">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] lg:w-[40%] h-[40%] bg-[#136F63]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[80%] lg:w-[50%] h-[50%] bg-[#136F63]/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      </div>

      {/* Navbar */}
      <nav className="relative w-full z-50 px-6 lg:px-12 py-6 lg:py-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-brand uppercase tracking-[0.4em] lg:tracking-[0.5em] text-2xl lg:text-3xl font-black block leading-none">
            FADEX
          </span>
        </div>
        <div className="flex items-center">
          <Badge
            variant="outline"
            className="rounded-full px-3 lg:px-5 py-1 lg:py-1.5 border-[#136F63]/10 text-[#136F63] font-brand text-[8px] lg:text-[10px] tracking-[0.2em] bg-[#136F63]/5 backdrop-blur-md"
          >
            PRE-BETA MVP
          </Badge>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 lg:px-6 max-w-7xl mx-auto w-full z-10 py-12 lg:py-0">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6 lg:space-y-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#136F63]/5 border border-[#136F63]/10 text-[#136F63] text-[9px] lg:text-[10px] font-brand tracking-[0.2em] uppercase">
            <Sparkles className="w-3 h-3" />
            Designed for storytellers
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-black tracking-tighter leading-[0.9] lg:leading-[0.85] text-[#191919]">
            Write the scenes. <br className="hidden sm:block" />
            <span className="text-[#136F63] italic font-serif serif relative inline-block">
              Shape
              <span className="absolute -bottom-1 lg:-bottom-2 left-0 w-full h-1 bg-[#136F63]/10 rounded-full" />
            </span>{" "}
            the narrative.
          </h1>

          <p className="text-base lg:text-xl text-[#5e5e5b] font-display max-w-2xl mx-auto leading-relaxed px-4">
            A minimalist, lightning-fast screenplay editor built for clarity.{" "}
            <br className="hidden lg:block" />
            <span className="opacity-60 italic">
              No distractions, just pure cinematic structure.
            </span>
          </p>

          <div className="pt-4 lg:pt-8 flex flex-col items-center gap-5 lg:gap-6 w-full px-6 lg:px-0">
            <Button
              onClick={onStart}
              className="group h-14 lg:h-16 w-full sm:w-lg px-10 lg:px-12 rounded-full bg-[#136F63] text-[#F3EFE0] text-sm font-brand uppercase tracking-[0.2em] shadow-[0_20px_50px_-10px_rgba(19,111,99,0.3)] hover:scale-[1.05] active:scale-[0.98] transition-all duration-500 hover:shadow-[0_25px_60px_-10px_rgba(19,111,99,0.4)] cursor-pointer"
            >
              Begin Writing
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-500" />
            </Button>
            <p className="text-[9px] lg:text-[10px] font-brand uppercase tracking-widest text-[#5e5e5b]/60">
              Instant Access • Free Forever
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-12 lg:mt-16 w-full grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-5xl">
          {[
            {
              icon: <CloudOff />,
              title: "Honest MVP",
              desc: "Stored locally in your browser. No databases yet, just instant, secure writing.",
            },
            {
              icon: <Box />,
              title: "Roadmap",
              desc: "Collaborative cloud syncing and robust production databases are coming next.",
            },
            {
              icon: <Sparkles />,
              title: "Future",
              desc: "AI-assisted storyboarding and professional character tracking in development.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group p-5 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] bg-white border border-[#136F63]/10 shadow-sm hover:shadow-2xl hover:shadow-[#136F63]/10 transition-all duration-500 hover:-translate-y-1 lg:hover:-translate-y-1.5 flex items-start gap-4 text-left"
            >
              <div className="shrink-0 w-10 h-10 rounded-2xl bg-[#136F63]/5 flex items-center justify-center text-[#136F63] group-hover:bg-[#136F63] group-hover:text-[#F3EFE0] transition-all duration-500">
                {React.cloneElement(
                  item.icon as React.ReactElement<{ className: string }>,
                  {
                    className: "w-5 h-5",
                  },
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-brand uppercase tracking-widest text-[9px] lg:text-[10px] font-black text-[#191919]">
                  {item.title}
                </h3>
                <p className="text-[10px] lg:text-[11px] text-[#5e5e5b] leading-relaxed font-display">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full py-6 lg:py-8 px-6 lg:px-12 shrink-0 flex items-center justify-center z-50 border-t border-[#136F63]/5 bg-white/5 backdrop-blur-sm">
        <div className="text-[8px] lg:text-[10px] font-brand uppercase tracking-[0.3em] lg:tracking-[0.4em] text-[#5e5e5b]/60 text-center">
          © 2026 FADEX SCREENWRITING • BUILT FOR THE CRAFT
        </div>
      </footer>
    </div>
  );
}
