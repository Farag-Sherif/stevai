"use client";
import React, { useRef, useEffect, useState } from "react";

export default function LazyVideo({ src, poster, autoPlay, ...rest }) {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (autoPlay && videoRef.current) {
            videoRef.current.play().catch((err) => console.error("Autoplay prevented:", err));
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, [autoPlay]);

  return (
    <video
      ref={videoRef}
      preload="metadata"
      poster={poster}
      {...rest}
    >
      {isVisible && <source src={src} type="video/mp4" />}
    </video>
  );
}
