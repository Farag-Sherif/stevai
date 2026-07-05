"use client";

import React from "react";
import { useLocale, useTranslations } from "@/i18n/react";

const methods = [
  {
    name: "بطاقات ائتمان / مدى",
    nameEn: "Credit Cards / Mada",
    status: "متاح الآن",
    statusEn: "Available Now",
    available: true,
    icon: "💳",
  },
  {
    name: "InstaPay",
    nameEn: "InstaPay",
    status: "متاح الآن",
    statusEn: "Available Now",
    available: true,
    icon: "📱",
  },
  {
    name: "فودافون كاش",
    nameEn: "Vodafone Cash",
    status: "متاح الآن",
    statusEn: "Available Now",
    available: true,
    icon: "📲",
  },
  {
    name: "الدفع عند الاستلام",
    nameEn: "Cash on Delivery",
    status: "متاح الآن",
    statusEn: "Available Now",
    available: true,
    icon: "🚚",
    highlight: true,
  },
];

export default function PaymentMethods() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const t = useTranslations();

  return (
    <section id="payment-methods" className="flat-spacing" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">
            {locale === "ar" ? "طرق الدفع المتاحة" : "Available Payment Methods"}
          </h3>
          <p className="subheading text-secondary">
            {locale === "ar"
              ? "نوفر لك عدة طرق دفع آمنة وسهلة"
              : "We offer you several safe and easy payment methods"}
          </p>
        </div>
        <div
          className="tf-payment__panel mt-4"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
        {methods.map((method) => (
          <div
            key={method.name}
            className="tf-payment__card"
            style={{
              flex: "1 1 220px",
              maxWidth: "280px",
              padding: "16px 18px",
              borderRadius: 12,
              border: method.highlight
                ? "2px solid var(--main, #029465)"
                : "1px solid #e0e0e0",
              background: method.highlight
                ? "linear-gradient(135deg, rgba(2, 148, 101, 0.05) 0%, rgba(2, 148, 101, 0.02) 100%)"
                : "#fafafa",
              transition: "all 0.3s ease",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              e.currentTarget.style.borderColor = "var(--main, #029465)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = method.highlight
                ? "var(--main, #029465)"
                : "#e0e0e0";
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 28 }}>{method.icon}</span>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#222",
                    marginBottom: 4,
                  }}
                >
                  {isRtl ? method.name : method.nameEn}
                </div>
                <div
                  style={{
                    color: method.available ? "var(--main, #029465)" : "#999",
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: method.available
                        ? "var(--main, #029465)"
                        : "#999",
                      display: "inline-block",
                    }}
                  />
                  {isRtl ? method.status : method.statusEn}
                </div>
              </div>
            </div>
            {method.highlight && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  background: "var(--main, #029465)",
                  color: "#fff",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {locale === "ar" ? "⭐ الأكثر استخداماً" : "⭐ Most Popular"}
              </div>
            )}
          </div>
        ))}
      </div>
        <div
          className="tf-payment__note mt-4"
          style={{
            width: "100%",
            background: "linear-gradient(135deg, rgba(2, 148, 101, 0.1) 0%, rgba(2, 148, 101, 0.05) 100%)",
            border: "2px solid var(--main, #029465)",
            borderRadius: 12,
            padding: "16px 20px",
            color: "#333",
          }}
        >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 24 }}>💡</span>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 6,
                color: "var(--main, #029465)",
              }}
            >
              {locale === "ar" ? "معلومة مهمة" : "Important Information"}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              {locale === "ar" ? (
                <>
                  <strong>الدفع عند الاستلام متاح:</strong> يمكنك الدفع نقداً عند استلام
                  طلبك. جميع طرق الدفع الإلكترونية (بطاقات الائتمان، InstaPay، فودافون
                  كاش) متاحة الآن ويمكن ربطها مع الـbackend عند الحاجة.
                </>
              ) : (
                <>
                  <strong>Cash on Delivery Available:</strong> You can pay in cash when
                  you receive your order. All electronic payment methods (Credit Cards,
                  InstaPay, Vodafone Cash) are now available and can be connected to the
                  backend when needed.
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

