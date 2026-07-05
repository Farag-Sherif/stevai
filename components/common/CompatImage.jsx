import React from "react";

export default function CompatImage({
  src,
  alt = "",
  width,
  height,
  fill,
  priority,
  sizes,
  style,
  className,
  quality,
  unoptimized,
  placeholder,
  blurDataURL,
  loader,
  fetchPriority,
  ...rest
}) {
  const resolvedSrc = typeof src === "string" ? src : src?.src || "";
  
  // Prevent CLS by defaulting to aspect-ratio if height is missing and width is present, or vice versa
  let computedStyle = style || {};
  if (fill) {
    computedStyle = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: style?.objectFit || "cover", ...style };
  } else if (!computedStyle.aspectRatio && width && height) {
    computedStyle = { ...computedStyle, aspectRatio: `${width} / ${height}` };
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : rest.loading || "lazy"}
      decoding={rest.decoding || "async"}
      fetchPriority={priority ? "high" : fetchPriority || "auto"}
      sizes={sizes}
      style={computedStyle}
      className={className}
      {...rest}
    />
  );
}

