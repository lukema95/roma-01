"use client";

import { useEffect } from "react";
import { useLanguage } from "@/store/useLanguage";

export default function LanguageProvider() {
  const initialize = useLanguage((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}

