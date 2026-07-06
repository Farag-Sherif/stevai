"use client";

import React, { useState, useEffect } from "react";
import CategoriesSidebar from "./CategoriesSidebar";
import { useLocale } from "@/i18n/react";

export default function CategoriesSidebarToggle() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const showButton = true;

  useEffect(() => {
    // Handle escape key to close sidebar
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    // Prevent body scroll when sidebar is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Toggle Button - Fixed position - Compact size for mobile and desktop */}
      {showButton && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="categories-sidebar-toggle-btn"
          style={{
          position: "fixed",
          right: isOpen ? "300px" : "0",
          top: "50%",
          transform: "translateY(-50%) rotate(180deg)",
          zIndex: 1041,
          background: "var(--main, #029465)",
          color: "#fff",
          border: "none",
          padding: "12px 8px",
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80px",
          minWidth: "56px",
          maxWidth: "56px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--main, #029465)";
          e.currentTarget.style.transform = "translateY(-50%) rotate(180deg) scale(1.05)";
          e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--main, #029465)";
          e.currentTarget.style.transform = "translateY(-50%) rotate(180deg) scale(1)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
        }}
        aria-label={locale === "ar" ? "فتح/إغلاق الأقسام" : "Toggle Categories"}
      >
        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
          <span style={{ fontSize: "12px", lineHeight: "1.3" }}>
            {isOpen 
              ? (locale === "ar" ? "إغلاق" : "Close") 
              : (locale === "ar" ? "الأقسام" : "Categories")}
          </span>
        </span>
      </button>
      )}

      {/* Sidebar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
            tabIndex={-1}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1039,
              cursor: "pointer",
            }}
            aria-hidden="true"
          />
          {/* Sidebar Content */}
          <div
            onClick={(e) => {
              // Prevent clicks inside sidebar from closing it
              e.stopPropagation();
            }}
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              height: "100vh",
              width: "300px",
              zIndex: 1040,
              transform: isOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.3s ease",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
            }}
          >
            <CategoriesSidebar />
          </div>
        </>
      )}
    </>
  );
}

