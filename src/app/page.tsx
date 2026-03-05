"use client";

import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { LandingPage } from "@/components/LandingPage";

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <Dashboard />;
  }

  return <LandingPage onStart={() => setShowDashboard(true)} />;
}
