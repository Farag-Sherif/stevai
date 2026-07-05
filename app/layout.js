import "../public/scss/main.scss";
import "photoswipe/style.css";
import "react-range-slider-input/dist/style.css";
import "../public/css/image-compare-viewer.min.css";

import Script from "@/components/common/Script";

import Context from "@/context/Context";
import QueryProvider from "@/components/providers/query-provider";
import ClientSideHandlers from "@/components/providers/ClientSideHandlers";

export default function RootLayout({ children }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  return (
    <html lang="en">
      <head>
        {/* Preconnect to API origin (helps TTFB for first API call) */}
        {apiUrl && (
          <link rel="preconnect" href={apiUrl} crossOrigin="anonymous" />
        )}
        <link rel="dns-prefetch" href="https://www.merchant.geidea.net" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="preload-wrapper popup-loader">
        <QueryProvider>
          <Context>
            <ClientSideHandlers />
            {children}
          </Context>
        </QueryProvider>

        {/* Geidea Checkout SDK */}
        <Script
          src="https://www.merchant.geidea.net/hpp/geideaCheckout.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
