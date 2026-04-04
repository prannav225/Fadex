"use client";

import { useState, useEffect } from "react";

export function useMobileKeyboard() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleResize = () => {
      const isVisible =
        window.visualViewport!.height < window.innerHeight - 150;
      setIsKeyboardVisible(isVisible);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    return () =>
      window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  return { isKeyboardVisible };
}
