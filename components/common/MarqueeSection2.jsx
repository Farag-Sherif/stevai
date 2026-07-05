"use client";
import React from "react";
import { getSlidersNews } from "@/api/slider";
import { useQuery } from "@tanstack/react-query";

function MarqueeRow({ slidersNews }) {
  if (!slidersNews?.length) return null;
  return (
    <>
      {slidersNews.map((slider, index) => (
        <React.Fragment key={index}>
          <div className="marquee-child-item">
            <span className="icon icon-lightning-line" />
          </div>
          <div className="marquee-child-item">
            <p className="text-btn-uppercase">{slider.title}</p>
          </div>
          <div className="marquee-child-item">
            <span className="icon icon-lightning-line" />
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

export default function MarqueeSection2({ parentClass = "tf-marquee" }) {
  const { data: slidersNews } = useQuery({
    queryKey: ["slidersNews"],
    queryFn: () => getSlidersNews(),
  });

  if (!slidersNews?.length) return null;

  return (
    <section className={`${parentClass} marquee-seamless`}>
      <div className="marquee-wrapper">
        <div className="initial-child-container" style={{ display: "flex", flexShrink: 0 }}>
          <MarqueeRow slidersNews={slidersNews} />
        </div>
        <div className="initial-child-container" style={{ display: "flex", flexShrink: 0 }} aria-hidden="true">
          <MarqueeRow slidersNews={slidersNews} />
        </div>
      </div>
    </section>
  );
}
