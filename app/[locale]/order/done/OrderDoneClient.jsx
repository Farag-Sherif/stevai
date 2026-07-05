"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "@/i18n/react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "@/router/navigation";
import { useContextElement } from "@/context/Context";
import { useUserStore } from "@/store/userStore";
import { cartStorage } from "@/utils/cartStorage";
import { removeAllFromCart } from "@/api/cart";

export default function OrderDoneClient() {
  const t = useTranslations("order");
  const searchParams = useSearchParams();
  const { setCartProducts } = useContextElement();
  const { user } = useUserStore();

  const gid = searchParams?.get("gid") || ""; // Geidea order id
  const oid = searchParams?.get("oid") || ""; // local order id (optional)
  const [stored, setStored] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("geidea_success");
      if (raw) setStored(JSON.parse(raw));
    } catch {
      setStored(null);
    }
  }, []);

  const orderId = useMemo(() => {
    return gid || oid || stored?.orderId || stored?.merchantReferenceId || "";
  }, [gid, oid, stored]);

  const isOk = useMemo(() => {
    const code = stored?.responseCode;
    const msg = stored?.responseMessage;
    return (
      String(code || "").startsWith("0") ||
      String(code || "").toLowerCase() === "success" ||
      (typeof msg === "string" && msg.toLowerCase().includes("success")) ||
      !!orderId
    );
  }, [stored, orderId]);

  // On successful payment: clear cart (localStorage + backend) so the user/guest sees empty cart
  useEffect(() => {
    if (!isOk) return;

    setCartProducts([]);

    if (typeof window !== "undefined") {
      localStorage.removeItem("cart"); // legacy key
      cartStorage.clearCart();
      localStorage.removeItem("geidea_success");
    }

    if (user) {
      removeAllFromCart().catch((e) =>
        console.error("Failed to clear backend cart after gate payment:", e)
      );
    }
  }, [isOk, setCartProducts, user]);

  return (
    <div className="page-content">
      <div className="container" style={{ paddingTop: 54, paddingBottom: 80 }}>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            borderRadius: 22,
            overflow: "hidden",
            background: "#fff",
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 18px 55px rgba(15, 23, 42, 0.10)",
          }}
        >
          <div
            style={{
              padding: "26px 22px 18px",
              background: isOk
                ? "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(34,197,94,0.06))"
                : "linear-gradient(135deg, rgba(245,158,11,0.16), rgba(245,158,11,0.06))",
              borderBottom: "1px solid rgba(15,23,42,0.06)",
              textAlign: "center",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 92,
                height: 92,
                margin: "0 auto 14px",
                borderRadius: 26,
                display: "grid",
                placeItems: "center",
                background: isOk
                  ? "rgba(34,197,94,0.20)"
                  : "rgba(245,158,11,0.20)",
                border: isOk
                  ? "1px solid rgba(34,197,94,0.28)"
                  : "1px solid rgba(245,158,11,0.28)",
              }}
            >
              {isOk ? (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 7L9 18l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, lineHeight: 1.2 }}>
              {isOk
                ? t("doneTitle", { default: "Payment Successful" })
                : t("processingTitle", { default: "Payment Processing" })}
            </h1>

            <p style={{ margin: "10px auto 0", maxWidth: 520, opacity: 0.9 }}>
              {isOk
                ? t("doneSubtitle", {
                    default: "Thank you! Your payment was confirmed.",
                  })
                : t("processingSubtitle", {
                    default:
                      "Your payment is being verified. Please check your orders shortly.",
                  })}
            </p>
          </div>

          <div style={{ padding: 22, textAlign: "center" }}>
            {orderId ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(15,23,42,0.08)",
                  background: "rgba(15,23,42,0.03)",
                  marginBottom: 18,
                }}
              >
                <span style={{ fontWeight: 800 }}>
                  {t("orderIdLabel", { default: "Order ID" })}:
                </span>
                <span
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontWeight: 800,
                    letterSpacing: 0.3,
                  }}
                >
                  {orderId}
                </span>
              </div>
            ) : (
              <div style={{ marginBottom: 18, opacity: 0.85 }}>
                {t("noOrderId", {
                  default: "Order ID was not found. You can still check your orders.",
                })}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link href={`/my-account-orders`} style={btnPrimary}>
                {t("viewOrders", { default: "View Orders" })}
              </Link>
              <Link href={`/`} style={btnGhost}>
                {t("backHome", { default: "Back Home" })}
              </Link>
            </div>

            <div style={{ marginTop: 14, opacity: 0.7, fontSize: 13 }}>
              {t("footerNote", {
                default:
                  "If you face any issue, contact support and share your Order ID.",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnPrimary = {
  borderRadius: 14,
  padding: "12px 16px",
  fontWeight: 800,
  background: "var(--main, #029465)",
  color: "#fff",
  border: "1px solid rgba(0,0,0,0.06)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 160,
};

const btnGhost = {
  borderRadius: 14,
  padding: "12px 16px",
  fontWeight: 800,
  background: "rgba(15,23,42,0.03)",
  color: "#111827",
  border: "1px solid rgba(15,23,42,0.10)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 160,
};
