"use client";
import Drift from "drift-zoom";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { useEffect, useRef, useState } from "react";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "@/components/common/CompatImage";

export default function Slider1({
  activeColor = "",
  setActiveColor = () => {},
  firstItem,
  media = [],
  colors = [],
}) {
  // Create image items from API data
  const createImageItems = () => {
    const items = [];

    // Add main product image
    if (firstItem) {
      items.push({
        id: 1,
        src: firstItem,
        alt: "Product Image",
        width: 713,
        height: 713,
        color: activeColor || "default",
      });
    }

    // Add media images
    if (media && media.length > 0) {
      media.forEach((mediaItem, index) => {
        // const mediaPath = `https://atlala.test.do-go.net/images/${mediaItem.image}`;
        items.push({
          id: index + 2,
          src: mediaItem.image_path,
          alt: `Product Image ${index + 2}`,
          width: 713,
          height: 713,
          color: activeColor || "default",
        });
      });
    }

    // Add color images
    if (colors && colors.length > 0) {
      colors.forEach((colorItem, index) => {
        if (
          colorItem.image_path &&
          !items.some((item) => item.src === colorItem.image_path)
        ) {
          items.push({
            id: items.length + 1,
            src: colorItem.image_path,
            alt: `Color ${colorItem.color}`,
            width: 713,
            height: 713,
            color: colorItem.color,
          });
        }
      });
    }

    return items.length > 0
      ? items
      : [
          {
            id: 1,
            src: "/images/products/default-product.jpg",
            alt: "Default Product Image",
            width: 713,
            height: 713,
            color: "default",
          },
        ];
  };

  const items = createImageItems();

  useEffect(() => {
    // Function to initialize Drift
    const imageZoom = () => {
      if (typeof window !== 'undefined' && window.innerWidth <= 991) return;
      const driftAll = document.querySelectorAll(".tf-image-zoom");
      const pane = document.querySelector(".tf-zoom-main");

      driftAll.forEach((el) => {
        new Drift(el, {
          zoomFactor: 2,
          paneContainer: pane,
          inlinePane: false,
          handleTouch: false,
          hoverBoundingBox: true,
          containInline: true,
        });
      });
    };
    imageZoom();
    const zoomElements = document.querySelectorAll(".tf-image-zoom");

    const handleMouseOver = (event) => {
      const parent = event.target.closest(".section-image-zoom");
      if (parent) {
        parent.classList.add("zoom-active");
      }
    };

    const handleMouseLeave = (event) => {
      const parent = event.target.closest(".section-image-zoom");
      if (parent) {
        parent.classList.remove("zoom-active");
      }
    };

    zoomElements.forEach((element) => {
      element.addEventListener("mouseover", handleMouseOver);
      element.addEventListener("mouseleave", handleMouseLeave);
    });

    // Cleanup event listeners on component unmount
    return () => {
      zoomElements.forEach((element) => {
        element.removeEventListener("mouseover", handleMouseOver);
        element.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [items]); // Dependency on items to reinitialize when images change

  const lightboxRef = useRef(null);
  useEffect(() => {
    // Initialize PhotoSwipeLightbox
    const lightbox = new PhotoSwipeLightbox({
      gallery: "#gallery-swiper-started",
      children: ".item",
      pswpModule: () => import("photoswipe"),
    });

    lightbox.init();

    // Store the lightbox instance in the ref for later use
    lightboxRef.current = lightbox;

    // Cleanup: destroy the lightbox when the component unmounts
    return () => {
      lightbox.destroy();
    };
  }, []);

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    if (
      activeColor &&
      items[activeIndex] &&
      items[activeIndex].color !== activeColor
    ) {
      const slideIndex = items.findIndex((item) => item.color === activeColor);
      if (slideIndex !== -1 && swiperRef.current) {
        swiperRef.current.slideTo(slideIndex);
      }
    }
  }, [activeColor, items, activeIndex]);

  // If we only have one image, render simple image display
  if (items.length === 1) {
    return (
      <div className="single-image-display">
        <div className="tf-product-media-main">
          <div className="item">
            <Image
              className="tf-image-zoom lazyload"
              data-zoom={items[0].src}
              data-src={items[0].src}
              alt={items[0].alt}
              src={items[0].src}
              width={items[0].width}
              height={items[0].height}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="thumbs-slider">
      <Swiper
        className="swiper tf-product-media-thumbs other-image-zoom"

        direction="vertical"
        spaceBetween={10}
        slidesPerView={Math.min(6, items.length)}
        onSwiper={setThumbsSwiper}
        modules={[Thumbs]}
        initialSlide={0}
        breakpoints={{
          0: {
            direction: "horizontal",
            slidesPerView: Math.min(4, items.length),
          },
          820: {
            direction: "horizontal",
            slidesPerView: Math.min(5, items.length),
          },
          920: {
            direction: "horizontal",
            slidesPerView: Math.min(6, items.length),
          },
          1020: {
            direction: "horizontal",
            slidesPerView: Math.min(6, items.length),
          },
          1200: {
            direction: "vertical",
            slidesPerView: Math.min(6, items.length),
          },
        }}
      >
        {items.map((slide, index) => (
          <SwiperSlide
            className="swiper-slide stagger-item"
            data-color={slide.color}
            key={index}
          >
            <div className="item">
              <Image
                className="lazyload"
                data-src={slide.src}
                alt={slide.alt}
                src={slide.src}
                width={slide.width}
                height={slide.height}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper

        className="swiper tf-product-media-main"
        id="gallery-swiper-started"
        spaceBetween={10}
        slidesPerView={1}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[Thumbs]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => {
          if (items[swiper.activeIndex]) {
            setActiveIndex(swiper.activeIndex);
            setActiveColor(items[swiper.activeIndex]?.color);
          }
        }}
      >
        {items.map((slide, index) => (
          <SwiperSlide
            key={index}
            className="swiper-slide"
            data-color={slide.color}
          >
            <a
              href={slide.src}
              target="_blank"
              className="item"
              data-pswp-width={slide.width}
              data-pswp-height={slide.height}
            >
              <Image
                className="tf-image-zoom lazyload"
                data-zoom={slide.src}
                data-src={slide.src}
                alt={slide.alt}
                src={slide.src}
                width={slide.width}
                height={slide.height}
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
