"use client";

import { checkOuCallback } from "@/api/checkout";

const GEIDEA_SCRIPT_SRC = "https://www.merchant.geidea.net/hpp/geideaCheckout.min.js";

function getGeideaConstructor() {
  if (typeof window === "undefined") return null;
  return window.GeideaCheckout || globalThis.GeideaCheckout || null;
}

async function ensureGeideaLoaded(timeoutMs = 12000) {
  if (typeof window === "undefined") {
    throw new Error("Geidea can only be used in the browser");
  }

  const existing = getGeideaConstructor();
  if (existing) return existing;

  // If script is present but still loading, wait for it.
  const existingScript = document.querySelector(`script[src="${GEIDEA_SCRIPT_SRC}"]`);
  if (!existingScript) {
    // Inject script (defensive in case the layout Script hasn't loaded yet)
    const script = document.createElement("script");
    script.src = GEIDEA_SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }

  const startedAt = Date.now();
  return await new Promise((resolve, reject) => {
    const tick = () => {
      const ctor = getGeideaConstructor();
      if (ctor) return resolve(ctor);
      if (Date.now() - startedAt > timeoutMs) {
        return reject(new Error("GeideaCheckout did not load in time"));
      }
      setTimeout(tick, 200);
    };
    tick();
  });
}

export async function redirectToGeideaCheckout(sessionId, localOrderId, locale = "en") {
  if (typeof window === "undefined") return;
  if (!sessionId) {
    console.error("Session ID is required");
    return;
  }

  let Checkout;
  try {
    Checkout = await ensureGeideaLoaded();
  } catch (err) {
    console.error("GeideaCheckout is not available:", err);
    return;
  }

  // Defensive cleanup for any previous instance / overlays (common source of errors after cancel)
  const cleanup = () => {
    try {
      const old = window.__geideaInstance;
      if (old?.close) old.close();
      if (old?.destroy) old.destroy();
    } catch {}
    try {
      // Remove common overlay containers if present
      document
        .querySelectorAll('[id*="geidea"], [class*="geidea"], iframe[src*="geidea"]')
        .forEach((el) => {
          try {
            el.remove();
          } catch {}
        });
    } catch {}
  };

  cleanup();

  const onSuccess = async (data) => {
    const reference = data?.reference || "";
    const geideaOrderId = data?.orderId || "";

    try {
      localStorage.setItem("geidea_success", JSON.stringify(data));
    } catch {}

    try {
      if (geideaOrderId) {
        await checkOuCallback(geideaOrderId);
      }
    } catch (err) {
      console.error("checkOuCallback failed:", err);
    }

    cleanup();

    const url =
      `/order/done?ref=${encodeURIComponent(reference)}` +
      `&gid=${encodeURIComponent(geideaOrderId)}` +
      `&oid=${encodeURIComponent(localOrderId || "")}`;

    window.location.assign(url);
  };

  const onError = (err) => {
    console.error("Geidea payment error:", err);
    cleanup();
  };

  const onCancel = (info) => {
    // User cancelled the payment gateway; allow opening it again without stale instance errors
    console.warn("Geidea payment cancelled:", info);
    cleanup();
  };

  // Geidea SDK supports (onSuccess, onError, onCancel)
  const payment = new Checkout(onSuccess, onError, onCancel);
  window.__geideaInstance = payment;

  payment.startPayment(sessionId);
}
