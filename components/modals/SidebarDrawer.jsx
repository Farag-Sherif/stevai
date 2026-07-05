"use client";

import React, { useEffect, useRef } from "react";
import SidebarNav from "@/components/common/SidebarNav";

export default function SidebarDrawer() {
  const offcanvasRef = useRef(null);

  useEffect(() => {
    const initBootstrap = async () => {
      if (typeof window !== "undefined") {
        const bootstrap = await import("bootstrap");
        
        // Initialize offcanvas
        const offcanvasElement = offcanvasRef.current;
        if (offcanvasElement) {
          let offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
          if (!offcanvasInstance) {
            offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement, {
              backdrop: true,
              scroll: false,
            });
          }
        }
      }
    };
    initBootstrap();

      // Handle clicks on sidebar toggle buttons
      const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const offcanvasElement = document.getElementById("sidebarDrawer");
        if (offcanvasElement) {
          const bootstrap = await import("bootstrap");
          let offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
          if (!offcanvasInstance) {
            offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement, {
              backdrop: true,
              scroll: false,
            });
          }
          offcanvasInstance.toggle();
        }
      };

      // Attach event listeners to all sidebar toggle buttons
      const toggleButtons = document.querySelectorAll('[data-sidebar-toggle="true"]');
      toggleButtons.forEach(button => {
        button.addEventListener('click', handleToggle);
      });

      return () => {
        toggleButtons.forEach(button => {
          button.removeEventListener('click', handleToggle);
        });
      };
  }, []);

  return (
    <div
      ref={offcanvasRef}
      className="offcanvas offcanvas-start"
      tabIndex={-1}
      id="sidebarDrawer"
      aria-labelledby="sidebarDrawerLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="sidebarDrawerLabel">
          أقسام الموقع
        </h5>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        />
      </div>
      <div className="offcanvas-body">
        <SidebarNav />
      </div>
    </div>
  );
}

