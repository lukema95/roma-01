"use client";

import { useEffect } from "react";
import { useTheme } from "@/store/useTheme";

export function ThemeProvider() {
  const initialize = useTheme((s) => s.initialize);
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  return null;
}

export default ThemeProvider;

