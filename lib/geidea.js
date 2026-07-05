// "use client";

// /**
//  * Geidea checkout helper
//  * - Starts payment using GeideaCheckout
//  * - On success stores payload in sessionStorage and navigates to the localized done page
//  */
// export function startGeideaPayment({ sessionId, router, locale, localOrderId }) {
//   if (typeof window === "undefined") return;
//   if (!sessionId) {
//     console.error("Session ID is required for Geidea checkout");
//     return;
//   }

//   const onSuccess = (data) => {
//     const payload = {
//       ...data,
//       sessionId,
//       localOrderId: localOrderId || null,
//       _ts: Date.now(),
//     };

//     try {
//       sessionStorage.setItem("geidea_success", JSON.stringify(payload));
//     } catch {}

//     // Your app uses /[locale]/... routes
//     const prefix = locale ? `/${locale}` : "";
//     router.push(`${prefix}/order/done`);
//   };

//   // Make sure GeideaCheckout exists (script loaded)
//   if (typeof window.GeideaCheckout === "undefined" && typeof GeideaCheckout === "undefined") {
//     return;
//   }

//   // Some SDKs attach to window
//   // eslint-disable-next-line no-undef
//   const Checkout = window.GeideaCheckout || GeideaCheckout;
//   const payment = new Checkout(onSuccess);
//   payment.startPayment(sessionId);
// }



'use client'

export function redirectToGeideaCheckout(sessionId, router, localOrderId) {
  if (typeof window === "undefined") return;
  if (!sessionId) return console.error("Session ID is required");

  const onSuccess = (data) => {
    const reference = data?.reference || "";
    const geideaOrderId = data?.orderId || "";

    // Navigate to done page (send minimal info)
    router.push(
      `/order/done?ref=${encodeURIComponent(reference)}&gid=${encodeURIComponent(
        geideaOrderId
      )}&oid=${encodeURIComponent(localOrderId || "")}`
    );
  };

  const payment = new GeideaCheckout(onSuccess);
  payment.startPayment(sessionId);
}
