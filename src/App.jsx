import React, { useEffect, useMemo } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import "@/public/scss/main.scss";
import "photoswipe/style.css";
import "react-range-slider-input/dist/style.css";
import "@/public/css/image-compare-viewer.min.css";
import AppRoutes from "./routes/AppRoutes";
import Context from "@/context/Context";
import QueryProvider from "@/components/providers/query-provider";
import ClientSideHandlers from "@/components/providers/ClientSideHandlers";
import LocaleDocument from "@/components/providers/LocaleDocument";
import ModalsWrapper from "@/components/modals/ModalsWrapper";
import Script from "@/components/common/Script";
import { I18nProvider } from "@/i18n/react";
import { messagesByLocale } from "@/i18n/messages";

function ensureLink(rel, href, crossOrigin) {
  if (typeof document === "undefined") return;
  const selector = crossOrigin
    ? `link[rel="${rel}"][href="${href}"][crossorigin="${crossOrigin}"]`
    : `link[rel="${rel}"][href="${href}"]`;

  if (document.head.querySelector(selector)) return;

  const link = document.createElement("link");
  link.setAttribute("rel", rel);
  link.setAttribute("href", href);
  if (crossOrigin) link.setAttribute("crossorigin", crossOrigin);
  document.head.appendChild(link);
}

function AppShell() {
  const location = useLocation();
  const locale = useMemo(() => {
    const match = location.pathname.match(/^\/(en|ar)(?:\/|$)/);
    return match?.[1] || "en";
  }, [location.pathname]);
  const messages = messagesByLocale[locale] || messagesByLocale.en || {};
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.add("preload-wrapper", "popup-loader");
    return () => {
      document.body.classList.remove("preload-wrapper", "popup-loader");
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const viewport = document.head.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1";
      document.head.appendChild(meta);
    }

    ensureLink("dns-prefetch", "https://www.merchant.geidea.net");
    if (apiUrl) ensureLink("preconnect", apiUrl, "anonymous");
  }, [apiUrl]);

  return (
    <I18nProvider locale={locale} messages={messages}>
      <LocaleDocument locale={locale} />
      <ClientSideHandlers />
      <div id="wrapper">
        <AppRoutes />
      </div>
      <ModalsWrapper />
      <Script src="https://www.merchant.geidea.net/hpp/geideaCheckout.min.js" />
    </I18nProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <Context>
          <AppShell />
        </Context>
      </QueryProvider>
    </BrowserRouter>
  );
}
