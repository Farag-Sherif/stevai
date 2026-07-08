"use client";

import { useEffect } from "react";

export default function LocaleDocument({ locale }) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const safeLocale = locale || "en";

    try {
      document.documentElement.lang = safeLocale;
      document.documentElement.dir = safeLocale === "ar" ? "rtl" : "ltr";
    } catch {
      // ignore
    }

    try {
      document.body.classList.toggle("rtl", safeLocale === "ar");
    } catch {
      // ignore
    }
  }, [locale]);

  return null;
}
