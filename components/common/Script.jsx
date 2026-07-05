import { useEffect } from "react";

export default function Script({ src, onLoad }) {
  useEffect(() => {
    if (!src || typeof document === "undefined") return undefined;
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (onLoad) onLoad();
      return undefined;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    if (onLoad) script.addEventListener("load", onLoad);
    document.body.appendChild(script);

    return () => {
      if (onLoad) script.removeEventListener("load", onLoad);
    };
  }, [src, onLoad]);

  return null;
}
