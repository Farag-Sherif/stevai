"use client";

import React, { useState } from "react";
import Image from "@/components/common/CompatImage";

const PLACEHOLDER = "/images/placeholder.jpg";

/**
 * Product image that falls back to placeholder on load error.
 * Fixes broken/missing images in cart, search, and product lists.
 */
export default function ProductImageWithFallback({
  src,
  alt = "Product",
  width = 600,
  height = 800,
  className = "",
  ...props
}) {
  const [error, setError] = useState(false);
  const imgSrc = src && !error ? src : PLACEHOLDER;

  return (
    <Image
      {...props}
      className={className}
      alt={alt}
      src={imgSrc}
      width={width}
      height={height}
      onError={() => setError(true)}
    />
  );
}
