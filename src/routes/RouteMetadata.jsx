import React, { useEffect } from "react";

function ensureMeta(name) {
  if (typeof document === "undefined") return null;
  let meta = document.head.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  return meta;
}

export default function RouteMetadata({ module, params }) {
  useEffect(() => {
    let active = true;

    const applyMetadata = (metadata) => {
      if (!active || !metadata || typeof document === "undefined") return;
      if (metadata.title) document.title = metadata.title;
      if (metadata.description) {
        const descriptionMeta = ensureMeta("description");
        descriptionMeta?.setAttribute("content", metadata.description);
      }
    };

    if (module?.metadata) {
      applyMetadata(module.metadata);
    }

    if (typeof module?.generateMetadata === "function") {
      Promise.resolve(module.generateMetadata({ params }))
        .then((resolved) => applyMetadata(resolved))
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [module, JSON.stringify(params || {})]);

  return null;
}
