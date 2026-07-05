"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/router/navigation";

export default function ClientSideHandlers() {
  const pathname = usePathname();
  const bootstrapRef = useRef(null);
  const wowInstanceRef = useRef(null);

  // Open site in normal state: remove hash (#account, #search, etc.) from URL on load
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", cleanUrl);
    }
  }, []);

  // Lazy-load bootstrap + WOW once
  useEffect(() => {
    let alive = true;

    import("bootstrap/dist/js/bootstrap.esm")
      .then((mod) => {
        if (!alive) return;
        bootstrapRef.current = mod;
      })
      .catch(() => {
        // ignore
      });

    import("@/utlis/wow")
      .then((WOW) => {
        if (!alive) return;
        const Ctor = WOW?.default ?? WOW;
        if (typeof Ctor !== "function") return;
        const wow = new Ctor({ mobile: false, live: false });
        wow.init();
        wowInstanceRef.current = wow;
      })
      .catch(() => {
        // ignore
      });

    return () => {
      alive = false;
    };
  }, []);

  // Single scroll listener (passive) for header background + hide/show
  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;
    let lastY = window.scrollY;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const header = document.querySelector("header");
        if (header) {
          const y = window.scrollY;

          if (y > 100) header.classList.add("header-bg");
          else header.classList.remove("header-bg");

          if (y > 250 && y > lastY) header.style.top = "-185px";
          else header.style.top = "0px";

          lastY = y;
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close any open bootstrap modals/offcanvas on navigation (no extra re-renders)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const closeAll = async () => {
      try {
        if (!bootstrapRef.current) {
          const mod = await import("bootstrap/dist/js/bootstrap.esm");
          bootstrapRef.current = mod;
        }

        const bs = bootstrapRef.current;
        const modals = document.querySelectorAll(".modal.show");
        modals.forEach((modal) => {
          const inst = bs?.Modal?.getInstance(modal);
          inst?.hide?.();
        });

        const offcanvas = document.querySelectorAll(".offcanvas.show");
        offcanvas.forEach((el) => {
          const inst = bs?.Offcanvas?.getInstance(el);
          inst?.hide?.();
        });

        // If WOW exists, sync animations for newly rendered content
        wowInstanceRef.current?.sync?.();
      } catch {
        // ignore
      }
    };

    closeAll();
  }, [pathname]);

  return null;
}
